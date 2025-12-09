import { 
  users, type User, type UpsertUser,
  jobs, type Job, type InsertJob,
  applications, type Application, type InsertApplication,
  resumes, type Resume, type InsertResume,
  interviewSessions, type InterviewSession, type InsertInterviewSession,
  userProfiles, type UserProfile, type InsertUserProfile,
  careerDimensions, type CareerDimension,
  userDimensionScores, type UserDimensionScore, type InsertUserDimensionScore,
  mentors, type Mentor,
  mentorConnections, type MentorConnection,
  peerConnections, type PeerConnection, type InsertPeerConnection,
  messages, type Message, type InsertMessage,
  supportTickets, type SupportTicket, type InsertSupportTicket
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  // Career DNA operations
  getCareerDimensions(): Promise<CareerDimension[]>;
  getUserDimensionScores(userId: string): Promise<UserDimensionScore[]>;
  saveUserDimensionScores(userId: string, scores: { dimensionId: string; score: number }[]): Promise<void>;
  
  // Job operations
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  searchJobs(query?: string, type?: string, location?: string, accessibilityFilters?: string[]): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  
  // Application operations
  getApplications(userId?: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;
  
  // Resume operations
  getResumes(userId?: string): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  
  // Interview session operations
  getInterviewSessions(userId?: string): Promise<InterviewSession[]>;
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | undefined>;
  
  // Mentor operations
  getMentors(): Promise<(Mentor & { user: User })[]>;
  getMentor(id: string): Promise<Mentor | undefined>;
  createMentor(userId: string, data: { expertise: string[]; bio: string; availability: string }): Promise<Mentor>;
  
  // Mentor connection operations
  getMentorConnections(userId: string): Promise<MentorConnection[]>;
  createMentorConnection(mentorId: string, menteeUserId: string, message?: string): Promise<MentorConnection>;
  updateMentorConnectionStatus(id: string, status: string): Promise<MentorConnection | undefined>;
  
  // Analytics operations
  getApplicationStats(userId: string): Promise<{
    total: number;
    applied: number;
    interviewing: number;
    offered: number;
    rejected: number;
  }>;
  
  // Seed data
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Career DNA operations
  async getCareerDimensions(): Promise<CareerDimension[]> {
    return db.select().from(careerDimensions).orderBy(careerDimensions.category, careerDimensions.order);
  }

  async getUserDimensionScores(userId: string): Promise<UserDimensionScore[]> {
    return db.select().from(userDimensionScores).where(eq(userDimensionScores.userId, userId));
  }

  async saveUserDimensionScores(userId: string, scores: { dimensionId: string; score: number }[]): Promise<void> {
    for (const { dimensionId, score } of scores) {
      await db
        .insert(userDimensionScores)
        .values({ userId, dimensionId, score })
        .onConflictDoUpdate({
          target: [userDimensionScores.userId, userDimensionScores.dimensionId],
          set: { score, updatedAt: new Date() },
        });
    }
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async searchJobs(query?: string, type?: string, location?: string, accessibilityFilters?: string[]): Promise<Job[]> {
    let conditions: any[] = [];
    
    if (query) {
      conditions.push(
        or(
          ilike(jobs.title, `%${query}%`),
          ilike(jobs.company, `%${query}%`),
          ilike(jobs.description, `%${query}%`)
        )
      );
    }
    
    if (type && type !== "all") {
      conditions.push(eq(jobs.type, type));
    }
    
    if (location && location !== "all") {
      if (location === "remote") {
        conditions.push(ilike(jobs.location, "remote"));
      } else {
        conditions.push(sql`${jobs.location} NOT ILIKE 'remote'`);
      }
    }
    
    let results: Job[];
    if (conditions.length === 0) {
      results = await this.getJobs();
    } else {
      results = await db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt));
    }
    
    if (accessibilityFilters && accessibilityFilters.length > 0) {
      results = results.filter(job => this.matchesAccessibilityFilters(job, accessibilityFilters));
    }
    
    return results;
  }
  
  private matchesAccessibilityFilters(job: Job, filters: string[]): boolean {
    if (!filters || filters.length === 0) return true;
    
    const features = job.accessibilityFeatures || [];
    const description = (job.description || "").toLowerCase();
    const accommodations = (job.accommodations || "").toLowerCase();
    const jobType = (job.type || "").toLowerCase();

    for (const filter of filters) {
      let matches = false;
      switch (filter) {
        case "remote":
          matches = jobType === "remote" || 
            features.some(f => f.toLowerCase().includes("remote")) ||
            description.includes("remote work") ||
            description.includes("work from home");
          break;
        case "flexible":
          matches = features.some(f => f.toLowerCase().includes("flexible")) ||
            description.includes("flexible hours") ||
            description.includes("flexible schedule") ||
            accommodations.includes("flexible");
          break;
        case "wheelchair":
          matches = features.some(f => f.toLowerCase().includes("wheelchair") || f.toLowerCase().includes("accessible")) ||
            description.includes("wheelchair accessible") ||
            accommodations.includes("wheelchair");
          break;
        case "screen-reader":
          matches = features.some(f => f.toLowerCase().includes("screen reader")) ||
            description.includes("screen reader") ||
            description.includes("assistive technology");
          break;
        case "mental-health":
          matches = features.some(f => f.toLowerCase().includes("mental health") || f.toLowerCase().includes("wellness")) ||
            description.includes("mental health") ||
            accommodations.includes("mental health");
          break;
        case "quiet-space":
          matches = features.some(f => f.toLowerCase().includes("quiet")) ||
            description.includes("quiet workspace") ||
            description.includes("quiet environment");
          break;
        default:
          matches = true;
      }
      if (!matches) return false;
    }
    return true;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  // Application operations
  async getApplications(userId?: string): Promise<Application[]> {
    if (userId) {
      return db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
    }
    return db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(application).returning();
    return newApp;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return true;
  }

  // Resume operations
  async getResumes(userId?: string): Promise<Resume[]> {
    if (userId) {
      return db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
    }
    return db.select().from(resumes).orderBy(desc(resumes.createdAt));
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  // Interview session operations
  async getInterviewSessions(userId?: string): Promise<InterviewSession[]> {
    if (userId) {
      return db.select().from(interviewSessions).where(eq(interviewSessions.userId, userId)).orderBy(desc(interviewSessions.createdAt));
    }
    return db.select().from(interviewSessions).orderBy(desc(interviewSessions.createdAt));
  }

  async createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession> {
    const [newSession] = await db.insert(interviewSessions).values(session).returning();
    return newSession;
  }

  async updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | undefined> {
    const [updated] = await db
      .update(interviewSessions)
      .set(updates)
      .where(eq(interviewSessions.id, id))
      .returning();
    return updated;
  }

  // Mentor operations
  async getMentors(): Promise<(Mentor & { user: User })[]> {
    const result = await db
      .select()
      .from(mentors)
      .innerJoin(users, eq(mentors.userId, users.id))
      .where(eq(mentors.isActive, true));
    
    return result.map(r => ({
      ...r.mentors,
      user: r.users,
    }));
  }

  async getMentor(id: string): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.id, id));
    return mentor;
  }

  async createMentor(userId: string, data: { expertise: string[]; bio: string; availability: string }): Promise<Mentor> {
    const [mentor] = await db
      .insert(mentors)
      .values({
        userId,
        expertise: data.expertise,
        bio: data.bio,
        availability: data.availability,
      })
      .returning();
    return mentor;
  }

  // Mentor connection operations
  async getMentorConnections(userId: string): Promise<MentorConnection[]> {
    return db.select().from(mentorConnections).where(eq(mentorConnections.menteeUserId, userId));
  }

  async createMentorConnection(mentorId: string, menteeUserId: string, message?: string): Promise<MentorConnection> {
    const [connection] = await db
      .insert(mentorConnections)
      .values({
        mentorId,
        menteeUserId,
        status: "pending",
        message,
      })
      .returning();
    return connection;
  }

  async updateMentorConnectionStatus(id: string, status: string): Promise<MentorConnection | undefined> {
    const [updated] = await db
      .update(mentorConnections)
      .set({ status })
      .where(eq(mentorConnections.id, id))
      .returning();
    return updated;
  }

  // Analytics operations
  async getApplicationStats(userId: string): Promise<{
    total: number;
    applied: number;
    interviewing: number;
    offered: number;
    rejected: number;
  }> {
    const apps = await this.getApplications(userId);
    return {
      total: apps.length,
      applied: apps.filter(a => a.status === "applied").length,
      interviewing: apps.filter(a => a.status === "interviewing").length,
      offered: apps.filter(a => a.status === "offered").length,
      rejected: apps.filter(a => a.status === "rejected").length,
    };
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    // Check if jobs already exist
    const existingJobs = await db.select().from(jobs).limit(1);
    if (existingJobs.length > 0) return;

    // Seed sample jobs
    const sampleJobs: InsertJob[] = [
      {
        title: "Software Engineer",
        company: "TechAccess Inc",
        location: "Remote",
        type: "full-time",
        salary: "$90,000 - $120,000",
        description: "Join our inclusive team building accessible web applications. We value diverse perspectives and provide comprehensive accommodations for all team members.",
        requirements: "3+ years of experience with React, TypeScript, and Node.js. Experience with accessibility standards (WCAG) is a plus.",
        accommodations: "Flexible hours, screen reader compatible tools, sign language interpreters available, ergonomic equipment provided",
        postedDate: "2024-12-01",
        accessibilityFeatures: ["Screen reader compatible", "Flexible hours", "Remote work", "Ergonomic equipment"],
      },
      {
        title: "UX Designer",
        company: "Inclusive Design Co",
        location: "New York, NY",
        type: "hybrid",
        salary: "$85,000 - $110,000",
        description: "Help us create beautiful, accessible user experiences. Our design team specializes in inclusive design principles and we welcome designers with disabilities.",
        requirements: "2+ years UX design experience. Proficiency in Figma or Sketch. Understanding of accessibility principles.",
        accommodations: "Accessible office space, flexible schedule, assistive technology provided, quiet workspace available",
        postedDate: "2024-12-03",
        accessibilityFeatures: ["Accessible office", "Quiet workspace", "Assistive technology", "Flexible schedule"],
      },
      {
        title: "Customer Success Manager",
        company: "AccessAbility Solutions",
        location: "Chicago, IL",
        type: "full-time",
        salary: "$70,000 - $90,000",
        description: "Build relationships with our clients and ensure their success with our accessibility tools. We prioritize hiring individuals with lived disability experience.",
        requirements: "Strong communication skills. Experience in customer service or account management. Passion for accessibility.",
        accommodations: "Wheelchair accessible office, service animals welcome, captioning services, modified work schedules",
        postedDate: "2024-12-05",
        accessibilityFeatures: ["Wheelchair accessible", "Service animals welcome", "Captioning services", "Modified schedules"],
      },
      {
        title: "Data Analyst",
        company: "EqualOpp Analytics",
        location: "Remote",
        type: "remote",
        salary: "$75,000 - $95,000",
        description: "Analyze data to drive insights for our clients. We provide all necessary accommodations and support a fully remote, accessible work environment.",
        requirements: "Experience with SQL, Python, and data visualization tools. Strong analytical skills. Attention to detail.",
        accommodations: "100% remote, flexible hours, accessible software tools, regular check-ins, mental health support",
        postedDate: "2024-12-06",
        accessibilityFeatures: ["100% Remote", "Flexible hours", "Accessible tools", "Mental health support"],
      },
      {
        title: "Marketing Coordinator",
        company: "Diverse Voices Media",
        location: "Los Angeles, CA",
        type: "part-time",
        salary: "$25 - $35/hour",
        description: "Coordinate marketing campaigns that celebrate diversity and inclusion. Part-time position with potential for full-time for the right candidate.",
        requirements: "Marketing or communications background. Social media management experience. Creative mindset.",
        accommodations: "Flexible part-time hours, accessible building, parking accommodations, work from home days",
        postedDate: "2024-12-07",
        accessibilityFeatures: ["Part-time flexible", "Accessible building", "Parking accommodations", "Hybrid option"],
      },
      {
        title: "Technical Writer",
        company: "DocuAccess",
        location: "Remote",
        type: "remote",
        salary: "$65,000 - $85,000",
        description: "Create clear, accessible documentation for software products. We use accessible authoring tools and provide training on inclusive writing practices.",
        requirements: "Excellent written communication. Experience with technical documentation. Familiarity with accessibility guidelines.",
        accommodations: "Remote work, voice dictation software, flexible deadlines, accessible document templates",
        postedDate: "2024-12-08",
        accessibilityFeatures: ["Remote work", "Voice dictation", "Flexible deadlines", "Accessible templates"],
      },
    ];

    for (const job of sampleJobs) {
      await db.insert(jobs).values(job);
    }

    // Seed Career DNA dimensions
    const dimensions = [
      // Strengths (10)
      { name: "Problem Solving", category: "Strengths", description: "Ability to analyze and solve complex problems", questionText: "How comfortable are you with solving complex problems?", order: 1 },
      { name: "Communication", category: "Strengths", description: "Verbal and written communication skills", questionText: "How would you rate your communication skills?", order: 2 },
      { name: "Leadership", category: "Strengths", description: "Ability to lead and inspire others", questionText: "How comfortable are you in leadership roles?", order: 3 },
      { name: "Creativity", category: "Strengths", description: "Creative thinking and innovation", questionText: "How creative do you consider yourself?", order: 4 },
      { name: "Attention to Detail", category: "Strengths", description: "Focus on accuracy and precision", questionText: "How important is attention to detail in your work?", order: 5 },
      { name: "Adaptability", category: "Strengths", description: "Ability to adjust to change", questionText: "How well do you adapt to new situations?", order: 6 },
      { name: "Teamwork", category: "Strengths", description: "Collaboration with others", questionText: "How well do you work in team settings?", order: 7 },
      { name: "Organization", category: "Strengths", description: "Planning and organizing tasks", questionText: "How organized are you in managing tasks?", order: 8 },
      { name: "Analytical Thinking", category: "Strengths", description: "Data analysis and logical reasoning", questionText: "How strong are your analytical skills?", order: 9 },
      { name: "Resilience", category: "Strengths", description: "Ability to overcome challenges", questionText: "How resilient are you when facing setbacks?", order: 10 },
      
      // Work Environment (10)
      { name: "Remote Work", category: "Work Environment", description: "Working from home", questionText: "How important is the ability to work remotely?", order: 1 },
      { name: "Flexible Hours", category: "Work Environment", description: "Non-traditional work schedules", questionText: "How important are flexible working hours?", order: 2 },
      { name: "Quiet Workspace", category: "Work Environment", description: "Low noise environment", questionText: "How important is a quiet workspace?", order: 3 },
      { name: "Collaborative Space", category: "Work Environment", description: "Open office environment", questionText: "How much do you enjoy collaborative workspaces?", order: 4 },
      { name: "Structured Environment", category: "Work Environment", description: "Clear routines and expectations", questionText: "How important is a structured work environment?", order: 5 },
      { name: "Autonomous Work", category: "Work Environment", description: "Independence in tasks", questionText: "How important is autonomy in your work?", order: 6 },
      { name: "Fast-Paced Environment", category: "Work Environment", description: "Dynamic and quick-moving", questionText: "How comfortable are you in fast-paced environments?", order: 7 },
      { name: "Mentorship Availability", category: "Work Environment", description: "Access to guidance and support", questionText: "How important is access to mentorship?", order: 8 },
      { name: "Work-Life Balance", category: "Work Environment", description: "Balance between work and personal life", questionText: "How important is work-life balance?", order: 9 },
      { name: "Physical Accessibility", category: "Work Environment", description: "Physically accessible workspace", questionText: "How important is physical workplace accessibility?", order: 10 },
      
      // Skills (10)
      { name: "Technical Skills", category: "Skills", description: "Programming, software, technology", questionText: "How strong are your technical/computer skills?", order: 1 },
      { name: "Writing Skills", category: "Skills", description: "Written communication", questionText: "How confident are you in your writing abilities?", order: 2 },
      { name: "Public Speaking", category: "Skills", description: "Presenting to groups", questionText: "How comfortable are you with public speaking?", order: 3 },
      { name: "Project Management", category: "Skills", description: "Managing projects and timelines", questionText: "How experienced are you in project management?", order: 4 },
      { name: "Data Analysis", category: "Skills", description: "Working with data and numbers", questionText: "How comfortable are you with data analysis?", order: 5 },
      { name: "Customer Service", category: "Skills", description: "Working with customers", questionText: "How strong are your customer service skills?", order: 6 },
      { name: "Design Skills", category: "Skills", description: "Visual and UX design", questionText: "How experienced are you with design work?", order: 7 },
      { name: "Research Skills", category: "Skills", description: "Conducting research and analysis", questionText: "How strong are your research abilities?", order: 8 },
      { name: "Financial Skills", category: "Skills", description: "Budgeting and financial management", questionText: "How comfortable are you with financial tasks?", order: 9 },
      { name: "Teaching/Training", category: "Skills", description: "Educating and training others", questionText: "How experienced are you in teaching or training?", order: 10 },
      
      // Interests (10)
      { name: "Technology", category: "Interests", description: "Working with technology", questionText: "How interested are you in technology?", order: 1 },
      { name: "Healthcare", category: "Interests", description: "Health and medical fields", questionText: "How interested are you in healthcare?", order: 2 },
      { name: "Education", category: "Interests", description: "Teaching and learning", questionText: "How interested are you in education?", order: 3 },
      { name: "Arts & Creative", category: "Interests", description: "Creative and artistic work", questionText: "How interested are you in arts and creative work?", order: 4 },
      { name: "Business", category: "Interests", description: "Business and entrepreneurship", questionText: "How interested are you in business?", order: 5 },
      { name: "Social Impact", category: "Interests", description: "Making a difference", questionText: "How important is social impact in your work?", order: 6 },
      { name: "Science", category: "Interests", description: "Scientific research and discovery", questionText: "How interested are you in science?", order: 7 },
      { name: "Finance", category: "Interests", description: "Financial services", questionText: "How interested are you in finance?", order: 8 },
      { name: "Marketing", category: "Interests", description: "Marketing and promotion", questionText: "How interested are you in marketing?", order: 9 },
      { name: "Environment", category: "Interests", description: "Environmental sustainability", questionText: "How interested are you in environmental work?", order: 10 },
      
      // Values (10)
      { name: "Job Security", category: "Values", description: "Stable employment", questionText: "How important is job security?", order: 1 },
      { name: "Compensation", category: "Values", description: "Salary and benefits", questionText: "How important is compensation?", order: 2 },
      { name: "Growth Opportunities", category: "Values", description: "Career advancement", questionText: "How important are growth opportunities?", order: 3 },
      { name: "Company Mission", category: "Values", description: "Meaningful work", questionText: "How important is believing in the company mission?", order: 4 },
      { name: "Diversity & Inclusion", category: "Values", description: "Inclusive workplace", questionText: "How important is workplace diversity and inclusion?", order: 5 },
      { name: "Innovation", category: "Values", description: "Working on new ideas", questionText: "How important is innovation in your work?", order: 6 },
      { name: "Recognition", category: "Values", description: "Being recognized for work", questionText: "How important is recognition for your contributions?", order: 7 },
      { name: "Team Culture", category: "Values", description: "Positive team dynamics", questionText: "How important is positive team culture?", order: 8 },
      { name: "Learning Opportunities", category: "Values", description: "Continuous learning", questionText: "How important are learning opportunities?", order: 9 },
      { name: "Ethical Practices", category: "Values", description: "Ethical company practices", questionText: "How important are ethical business practices?", order: 10 },
      
      // Accessibility Needs (6)
      { name: "Screen Reader Support", category: "Accessibility", description: "Compatible with screen readers", questionText: "How important is screen reader compatibility?", order: 1 },
      { name: "Mobility Accommodations", category: "Accessibility", description: "Physical accessibility", questionText: "How important are mobility accommodations?", order: 2 },
      { name: "Hearing Accommodations", category: "Accessibility", description: "Captioning, ASL support", questionText: "How important are hearing accommodations?", order: 3 },
      { name: "Cognitive Accommodations", category: "Accessibility", description: "Clear instructions, extra time", questionText: "How important are cognitive accommodations?", order: 4 },
      { name: "Mental Health Support", category: "Accessibility", description: "Mental health resources", questionText: "How important is mental health support?", order: 5 },
      { name: "Assistive Technology", category: "Accessibility", description: "Specialized tools and software", questionText: "How important is access to assistive technology?", order: 6 },
    ];

    for (const dim of dimensions) {
      await db.insert(careerDimensions).values(dim);
    }
  }
}

export const storage = new DatabaseStorage();

import { 
  users, type User, type UpsertUser, type RegisterUser,
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
  supportTickets, type SupportTicket, type InsertSupportTicket,
  magicLinkTokens, type MagicLinkToken,
  emailLogs, type EmailLog
} from "@shared/schema";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getCommunityMembers(): Promise<User[]>;
  
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
  getResume(id: string): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: string, updates: Partial<Resume>): Promise<Resume | undefined>;
  
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
  
  // Magic link token operations
  createMagicLinkToken(email: string, token: string, expiresAt: Date): Promise<MagicLinkToken>;
  getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined>;
  markMagicLinkTokenUsed(token: string): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Email log operations
  logEmail(userId: string | null, email: string, emailType: string): Promise<EmailLog>;
  hasWelcomeEmailBeenSent(email: string): Promise<boolean>;
  
  // Password auth operations
  createUserWithPassword(userData: RegisterUser & { hashedPassword: string }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  verifyUserEmail(email: string): Promise<void>;
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

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionTier?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...stripeInfo, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCommunityMembers(): Promise<User[]> {
    return db.select().from(users).where(sql`${users.role} IS NOT NULL`);
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

  async getResume(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume | undefined> {
    const [updated] = await db
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updated;
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

  // Seed data removed - app starts empty, using real job search API
  async seedInitialData(): Promise<void> {
    // No longer seeding mock data
  }

  // Magic link token operations
  async createMagicLinkToken(email: string, token: string, expiresAt: Date): Promise<MagicLinkToken> {
    const [magicToken] = await db
      .insert(magicLinkTokens)
      .values({ email, token, expiresAt })
      .returning();
    return magicToken;
  }

  async getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined> {
    const [magicToken] = await db
      .select()
      .from(magicLinkTokens)
      .where(eq(magicLinkTokens.token, token));
    return magicToken;
  }

  async markMagicLinkTokenUsed(token: string): Promise<void> {
    await db
      .update(magicLinkTokens)
      .set({ used: true })
      .where(eq(magicLinkTokens.token, token));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  // Email log operations
  async logEmail(userId: string | null, email: string, emailType: string): Promise<EmailLog> {
    const [log] = await db
      .insert(emailLogs)
      .values({ userId, email, emailType })
      .returning();
    return log;
  }

  async hasWelcomeEmailBeenSent(email: string): Promise<boolean> {
    const [log] = await db
      .select()
      .from(emailLogs)
      .where(and(
        eq(emailLogs.email, email),
        eq(emailLogs.emailType, 'welcome')
      ));
    return !!log;
  }

  // Password auth operations
  async createUserWithPassword(userData: RegisterUser & { hashedPassword: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName || null,
        emailVerified: false,
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async verifyUserEmail(email: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.email, email));
  }
}

export const storage = new DatabaseStorage();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

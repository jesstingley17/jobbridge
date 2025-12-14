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
  emailLogs, type EmailLog,
  notes, type Note, type InsertNote,
  blogPosts, type BlogPost, type InsertBlogPost,
  communityPosts, type CommunityPost, type InsertCommunityPost,
  postComments, type PostComment, type InsertPostComment,
  postReactions, type PostReaction,
  communityGroups, type CommunityGroup, type InsertCommunityGroup,
  groupMembers, type GroupMember,
  forums, type Forum, type InsertForum,
  forumTopics, type ForumTopic, type InsertForumTopic,
  forumReplies, type ForumReply, type InsertForumReply,
  communityEvents, type CommunityEvent, type InsertCommunityEvent,
  eventAttendees, type EventAttendee,
  activityFeed, type ActivityFeed,
  notifications, type Notification, type InsertNotification
} from "../shared/schema.js";
import bcrypt from "bcrypt";
import { db } from "./db.js";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUserCommunityUsername(id: string, username: string | null): Promise<User | undefined>;
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
  
  // Notes operations (Supabase integration)
  getNotes(): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<void>;
  
  // Blog post operations
  getBlogPosts(search?: string, tag?: string): Promise<BlogPost[]>;
  getAllBlogPosts(): Promise<BlogPost[]>; // Admin: get all posts including unpublished
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  getBlogPostByContentfulId(contentfulId: string): Promise<BlogPost | undefined>;
  upsertBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;
  incrementBlogPostViews(slug: string): Promise<void>;
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

  async updateUserCommunityUsername(id: string, username: string | null): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ communityUsername: username, updatedAt: new Date() })
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
    // Normalize and type the resume data to ensure compatibility with Drizzle
    const normalizedResume: any = {
      userId: resume.userId,
      title: resume.title,
      content: resume.content,
      skills: resume.skills || null,
      isParsed: resume.isParsed || false,
    };
    
    // Normalize contactInfo
    if (resume.contactInfo) {
      normalizedResume.contactInfo = {
        name: String((resume.contactInfo as any).name || ''),
        email: (resume.contactInfo as any).email ? String((resume.contactInfo as any).email) : undefined,
        phone: (resume.contactInfo as any).phone ? String((resume.contactInfo as any).phone) : undefined,
        linkedin: (resume.contactInfo as any).linkedin ? String((resume.contactInfo as any).linkedin) : undefined,
        portfolio: (resume.contactInfo as any).portfolio ? String((resume.contactInfo as any).portfolio) : undefined,
      };
    } else {
      normalizedResume.contactInfo = null;
    }
    
    // Normalize experience array
    if (resume.experience && Array.isArray(resume.experience)) {
      normalizedResume.experience = resume.experience.map((exp: any) => ({
        company: String(exp.company || ''),
        title: String(exp.title || ''),
        dates: exp.dates ? String(exp.dates) : undefined,
        description: exp.description ? String(exp.description) : undefined,
      }));
    } else {
      normalizedResume.experience = null;
    }
    
    // Normalize education array
    if (resume.education && Array.isArray(resume.education)) {
      normalizedResume.education = resume.education.map((edu: any) => ({
        school: String(edu.school || ''),
        degree: edu.degree ? String(edu.degree) : undefined,
        major: edu.major ? String(edu.major) : undefined,
        gradYear: edu.gradYear ? String(edu.gradYear) : undefined,
      }));
    } else {
      normalizedResume.education = null;
    }
    
    // Use explicit type assertion to satisfy Drizzle's type requirements
    const [newResume] = await db.insert(resumes).values(normalizedResume as any).returning();
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
    
    return result.map((r: any) => ({
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
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    } catch (error: any) {
      console.error("Error in getUserByEmail:", error);
      throw error;
    }
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
    const now = new Date();
    
    // Try with all fields first
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: userData.email,
          password: userData.hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName || null,
          emailVerified: false,
          termsAccepted: userData.termsAccepted ?? false,
          termsAcceptedAt: userData.termsAccepted ? now : null,
          marketingConsent: userData.marketingConsent ?? false,
          marketingConsentAt: userData.marketingConsent ? now : null,
        })
        .returning();
      return user;
    } catch (error: any) {
      // If columns don't exist (PostgreSQL error code 42703 = undefined_column),
      // retry without the timestamp fields
      if (error.code === '42703' || 
          error.message?.includes('column') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('terms_accepted_at') ||
          error.message?.includes('marketing_consent_at')) {
        console.warn("Consent timestamp columns don't exist, creating user without them. Run migration: migrations/add_user_consent_fields.sql");
        const [user] = await db
          .insert(users)
          .values({
            email: userData.email,
            password: userData.hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName || null,
            emailVerified: false,
            termsAccepted: userData.termsAccepted ?? false,
            marketingConsent: userData.marketingConsent ?? false,
          })
          .returning();
        return user;
      }
      // Re-throw other errors
      console.error("Error creating user with password:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table
      });
      throw error;
    }
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

  // Notes operations
  async getNotes(): Promise<Note[]> {
    return db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Blog post operations
  async getBlogPosts(search?: string, tag?: string): Promise<BlogPost[]> {
    let conditions = [eq(blogPosts.published, true)];
    
    if (search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.excerpt || sql`''`, `%${search}%`),
          ilike(blogPosts.content, `%${search}%`)
        )!
      );
    }
    
    const posts = await db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt));
    
    if (tag) {
      return posts.filter((post: any) => post.tags?.includes(tag));
    }
    
    return posts;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)));
    return post;
  }

  async getBlogPostByContentfulId(contentfulId: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.contentfulId, contentfulId));
    return post;
  }

  async upsertBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    if (post.contentfulId) {
      // Check if post exists by Contentful ID
      const existing = await this.getBlogPostByContentfulId(post.contentfulId);
      if (existing) {
        // Update existing post
        const [updated] = await db
          .update(blogPosts)
          .set({
            ...post,
            updatedAt: new Date(),
          })
          .where(eq(blogPosts.contentfulId, post.contentfulId))
          .returning();
        return updated;
      }
    }
    
    // Insert new post
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async incrementBlogPostViews(slug: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.slug, slug));
  }

  // Admin blog post operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    try {
      return await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt));
    } catch (error: any) {
      console.error("Error in getAllBlogPosts:", error);
      throw error;
    }
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db
      .update(blogPosts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Community Posts operations
  async getCommunityPosts(userId?: string, groupId?: string, limit: number = 20, offset: number = 0): Promise<(CommunityPost & { author: User })[]> {
    let query = db
      .select({
        id: communityPosts.id,
        authorId: communityPosts.authorId,
        content: communityPosts.content,
        mediaUrls: communityPosts.mediaUrls,
        postType: communityPosts.postType,
        groupId: communityPosts.groupId,
        forumId: communityPosts.forumId,
        isPinned: communityPosts.isPinned,
        isPublic: communityPosts.isPublic,
        tags: communityPosts.tags,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        sharesCount: communityPosts.sharesCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: users,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.authorId, users.id))
      .$dynamic();

    const conditions = [];
    if (userId) conditions.push(eq(communityPosts.authorId, userId));
    if (groupId) conditions.push(eq(communityPosts.groupId, groupId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r: any) => ({
      ...r,
      author: r.author,
    })) as (CommunityPost & { author: User })[];
  }

  async getCommunityPost(id: string): Promise<(CommunityPost & { author: User }) | undefined> {
    const [result] = await db
      .select({
        id: communityPosts.id,
        authorId: communityPosts.authorId,
        content: communityPosts.content,
        mediaUrls: communityPosts.mediaUrls,
        postType: communityPosts.postType,
        groupId: communityPosts.groupId,
        forumId: communityPosts.forumId,
        isPinned: communityPosts.isPinned,
        isPublic: communityPosts.isPublic,
        tags: communityPosts.tags,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        sharesCount: communityPosts.sharesCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: users,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.authorId, users.id))
      .where(eq(communityPosts.id, id));

    if (!result) return undefined;
    return { ...result, author: result.author } as CommunityPost & { author: User };
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    
    if (post.groupId) {
      await db
        .update(communityGroups)
        .set({ postsCount: sql`${communityGroups.postsCount} + 1` })
        .where(eq(communityGroups.id, post.groupId));
    }
    
    await this.createActivity({
      userId: post.authorId,
      activityType: "post_created",
      targetType: "post",
      targetId: newPost.id,
      metadata: {},
      isPublic: post.isPublic ?? true,
    });
    
    return newPost;
  }

  async updateCommunityPost(id: string, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const [updated] = await db
      .update(communityPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communityPosts.id, id))
      .returning();
    return updated;
  }

  async deleteCommunityPost(id: string): Promise<void> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    
    if (post?.groupId) {
      await db
        .update(communityGroups)
        .set({ postsCount: sql`${communityGroups.postsCount} - 1` })
        .where(eq(communityGroups.id, post.groupId));
    }
    
    await db.delete(communityPosts).where(eq(communityPosts.id, id));
  }

  // Post Comments operations
  async getPostComments(postId: string): Promise<(PostComment & { author: User })[]> {
    const results = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        authorId: postComments.authorId,
        content: postComments.content,
        parentCommentId: postComments.parentCommentId,
        likesCount: postComments.likesCount,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        author: users,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.authorId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return results.map((r: any) => ({ ...r, author: r.author })) as (PostComment & { author: User })[];
  }

  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db.insert(postComments).values(comment).returning();
    
    await db
      .update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    await this.createActivity({
      userId: comment.authorId,
      activityType: "comment_added",
      targetType: "post",
      targetId: comment.postId,
      metadata: {},
      isPublic: true,
    });
    
    return newComment;
  }

  async deletePostComment(id: string): Promise<void> {
    const [comment] = await db.select().from(postComments).where(eq(postComments.id, id));
    
    if (comment) {
      await db
        .update(communityPosts)
        .set({ commentsCount: sql`${communityPosts.commentsCount} - 1` })
        .where(eq(communityPosts.id, comment.postId));
    }
    
    await db.delete(postComments).where(eq(postComments.id, id));
  }

  // Post Reactions operations
  async getPostReactions(postId: string): Promise<PostReaction[]> {
    return db.select().from(postReactions).where(eq(postReactions.postId, postId));
  }

  async togglePostReaction(postId: string, userId: string, reactionType: string = "like"): Promise<PostReaction | null> {
    const [existing] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)));

    if (existing) {
      await db
        .delete(postReactions)
        .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)));
      
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
        .where(eq(communityPosts.id, postId));
      
      return null;
    } else {
      const [newReaction] = await db
        .insert(postReactions)
        .values({ postId, userId, reactionType })
        .returning();
      
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, postId));
      
      return newReaction;
    }
  }

  // Community Groups operations
  async getCommunityGroups(category?: string, limit: number = 50): Promise<(CommunityGroup & { owner: User; memberCount: number })[]> {
    let query = db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        slug: communityGroups.slug,
        coverImageUrl: communityGroups.coverImageUrl,
        avatarUrl: communityGroups.avatarUrl,
        ownerId: communityGroups.ownerId,
        category: communityGroups.category,
        isPublic: communityGroups.isPublic,
        isPrivate: communityGroups.isPrivate,
        membersCount: communityGroups.membersCount,
        postsCount: communityGroups.postsCount,
        rules: communityGroups.rules,
        tags: communityGroups.tags,
        createdAt: communityGroups.createdAt,
        updatedAt: communityGroups.updatedAt,
        owner: users,
      })
      .from(communityGroups)
      .leftJoin(users, eq(communityGroups.ownerId, users.id))
      .$dynamic();

    if (category) {
      query = query.where(eq(communityGroups.category, category));
    }

    const results = await query
      .orderBy(desc(communityGroups.membersCount), desc(communityGroups.createdAt))
      .limit(limit);

    // Get member counts separately
    const groupsWithCounts = await Promise.all(
      results.map(async (group: any) => {
        const memberCountResult = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));
        
        return {
          ...group,
          owner: group.owner,
          memberCount: Number(memberCountResult[0]?.count) || 0,
        };
      })
    );

    return groupsWithCounts as (CommunityGroup & { owner: User; memberCount: number })[];
  }

  async getCommunityGroup(id: string): Promise<(CommunityGroup & { owner: User; memberCount: number }) | undefined> {
    const [result] = await db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        slug: communityGroups.slug,
        coverImageUrl: communityGroups.coverImageUrl,
        avatarUrl: communityGroups.avatarUrl,
        ownerId: communityGroups.ownerId,
        category: communityGroups.category,
        isPublic: communityGroups.isPublic,
        isPrivate: communityGroups.isPrivate,
        membersCount: communityGroups.membersCount,
        postsCount: communityGroups.postsCount,
        rules: communityGroups.rules,
        tags: communityGroups.tags,
        createdAt: communityGroups.createdAt,
        updatedAt: communityGroups.updatedAt,
        owner: users,
      })
      .from(communityGroups)
      .leftJoin(users, eq(communityGroups.ownerId, users.id))
      .where(eq(communityGroups.id, id));

    if (!result || !result.owner) return undefined;

    const memberCountResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id));

    return {
      ...result,
      owner: result.owner,
      memberCount: Number(memberCountResult[0]?.count) || 0,
    };
  }

  async createCommunityGroup(group: InsertCommunityGroup): Promise<CommunityGroup> {
    const [newGroup] = await db.insert(communityGroups).values(group).returning();
    
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: group.ownerId,
      role: "admin",
      status: "active",
    });
    
    return newGroup;
  }

  async updateCommunityGroup(id: string, updates: Partial<InsertCommunityGroup>): Promise<CommunityGroup | undefined> {
    const [updated] = await db
      .update(communityGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communityGroups.id, id))
      .returning();
    return updated;
  }

  async deleteCommunityGroup(id: string): Promise<void> {
    await db.delete(communityGroups).where(eq(communityGroups.id, id));
  }

  // Group Members operations
  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const results = await db
      .select({
        id: groupMembers.id,
        groupId: groupMembers.groupId,
        userId: groupMembers.userId,
        role: groupMembers.role,
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
        user: users,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.joinedAt);

    return results.map((r: any) => ({ ...r, user: r.user })) as (GroupMember & { user: User })[];
  }

  async joinGroup(groupId: string, userId: string): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values({ groupId, userId, role: "member", status: "active" })
      .returning();
    
    await db
      .update(communityGroups)
      .set({ membersCount: sql`${communityGroups.membersCount} + 1` })
      .where(eq(communityGroups.id, groupId));
    
    await this.createActivity({
      userId,
      activityType: "group_joined",
      targetType: "group",
      targetId: groupId,
      metadata: {},
      isPublic: true,
    });
    
    return member;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    
    await db
      .update(communityGroups)
      .set({ membersCount: sql`${communityGroups.membersCount} - 1` })
      .where(eq(communityGroups.id, groupId));
  }

  async updateGroupMemberRole(groupId: string, userId: string, role: string): Promise<GroupMember | undefined> {
    const [updated] = await db
      .update(groupMembers)
      .set({ role })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .returning();
    return updated;
  }

  // Forums operations
  async getForums(): Promise<Forum[]> {
    return db.select().from(forums).orderBy(forums.order, forums.name);
  }

  async getForum(id: string): Promise<Forum | undefined> {
    const [forum] = await db.select().from(forums).where(eq(forums.id, id));
    return forum;
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const [newForum] = await db.insert(forums).values(forum).returning();
    return newForum;
  }

  // Forum Topics operations
  async getForumTopics(forumId: string, limit: number = 20, offset: number = 0): Promise<(ForumTopic & { author: User })[]> {
    const results = await db
      .select({
        id: forumTopics.id,
        forumId: forumTopics.forumId,
        authorId: forumTopics.authorId,
        title: forumTopics.title,
        content: forumTopics.content,
        slug: forumTopics.slug,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        lastReplyAt: forumTopics.lastReplyAt,
        lastReplyBy: forumTopics.lastReplyBy,
        tags: forumTopics.tags,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        author: users,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.forumId, forumId))
      .orderBy(desc(forumTopics.isPinned), desc(forumTopics.lastReplyAt), desc(forumTopics.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r: any) => ({ ...r, author: r.author })) as (ForumTopic & { author: User })[];
  }

  async getForumTopic(id: string): Promise<(ForumTopic & { author: User }) | undefined> {
    const [result] = await db
      .select({
        id: forumTopics.id,
        forumId: forumTopics.forumId,
        authorId: forumTopics.authorId,
        title: forumTopics.title,
        content: forumTopics.content,
        slug: forumTopics.slug,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        lastReplyAt: forumTopics.lastReplyAt,
        lastReplyBy: forumTopics.lastReplyBy,
        tags: forumTopics.tags,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        author: users,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.id, id));

    if (!result || !result.author) return undefined;
    return { ...result, author: result.author };
  }

  async createForumTopic(topic: InsertForumTopic): Promise<ForumTopic> {
    const [newTopic] = await db.insert(forumTopics).values(topic).returning();
    
    await db
      .update(forums)
      .set({ 
        topicsCount: sql`${forums.topicsCount} + 1`,
        lastPostAt: new Date(),
        lastPostBy: topic.authorId,
      })
      .where(eq(forums.id, topic.forumId));
    
    return newTopic;
  }

  async incrementTopicViews(id: string): Promise<void> {
    await db
      .update(forumTopics)
      .set({ viewsCount: sql`${forumTopics.viewsCount} + 1` })
      .where(eq(forumTopics.id, id));
  }

  // Forum Replies operations
  async getForumReplies(topicId: string): Promise<(ForumReply & { author: User })[]> {
    const results = await db
      .select({
        id: forumReplies.id,
        topicId: forumReplies.topicId,
        authorId: forumReplies.authorId,
        content: forumReplies.content,
        parentReplyId: forumReplies.parentReplyId,
        likesCount: forumReplies.likesCount,
        isSolution: forumReplies.isSolution,
        createdAt: forumReplies.createdAt,
        updatedAt: forumReplies.updatedAt,
        author: users,
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(eq(forumReplies.topicId, topicId))
      .orderBy(forumReplies.createdAt);

    return results.map((r: any) => ({ ...r, author: r.author })) as (ForumReply & { author: User })[];
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    
    await db
      .update(forumTopics)
      .set({ 
        repliesCount: sql`${forumTopics.repliesCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyBy: reply.authorId,
      })
      .where(eq(forumTopics.id, reply.topicId));
    
    const [topic] = await db.select().from(forumTopics).where(eq(forumTopics.id, reply.topicId));
    if (topic) {
      await db
        .update(forums)
        .set({
          postsCount: sql`${forums.postsCount} + 1`,
          lastPostAt: new Date(),
          lastPostBy: reply.authorId,
        })
        .where(eq(forums.id, topic.forumId));
    }
    
    return newReply;
  }

  async markReplyAsSolution(replyId: string): Promise<void> {
    await db
      .update(forumReplies)
      .set({ isSolution: true })
      .where(eq(forumReplies.id, replyId));
  }

  // Community Events operations
  async getCommunityEvents(limit: number = 20, upcoming: boolean = true): Promise<(CommunityEvent & { organizer: User; attendeeCount: number })[]> {
    let query = db
      .select({
        id: communityEvents.id,
        organizerId: communityEvents.organizerId,
        title: communityEvents.title,
        description: communityEvents.description,
        slug: communityEvents.slug,
        eventType: communityEvents.eventType,
        startDate: communityEvents.startDate,
        endDate: communityEvents.endDate,
        location: communityEvents.location,
        locationUrl: communityEvents.locationUrl,
        coverImageUrl: communityEvents.coverImageUrl,
        isOnline: communityEvents.isOnline,
        isPublic: communityEvents.isPublic,
        maxAttendees: communityEvents.maxAttendees,
        attendeesCount: communityEvents.attendeesCount,
        registrationRequired: communityEvents.registrationRequired,
        registrationUrl: communityEvents.registrationUrl,
        tags: communityEvents.tags,
        createdAt: communityEvents.createdAt,
        updatedAt: communityEvents.updatedAt,
        organizer: users,
      })
      .from(communityEvents)
      .leftJoin(users, eq(communityEvents.organizerId, users.id))
      .$dynamic();

    if (upcoming) {
      query = query.where(sql`${communityEvents.startDate} >= NOW()`);
    }

    const results = await query
      .orderBy(communityEvents.startDate)
      .limit(limit);

    // Get attendee counts separately
    const eventsWithCounts = await Promise.all(
      results.map(async (event: any) => {
        const attendeeCountResult = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(eventAttendees)
          .where(eq(eventAttendees.eventId, event.id));
        
        return {
          ...event,
          organizer: event.organizer,
          attendeeCount: Number(attendeeCountResult[0]?.count) || 0,
        };
      })
    );

    return eventsWithCounts as (CommunityEvent & { organizer: User; attendeeCount: number })[];
  }

  async getCommunityEvent(id: string): Promise<(CommunityEvent & { organizer: User; attendeeCount: number }) | undefined> {
    const [result] = await db
      .select({
        id: communityEvents.id,
        organizerId: communityEvents.organizerId,
        title: communityEvents.title,
        description: communityEvents.description,
        slug: communityEvents.slug,
        eventType: communityEvents.eventType,
        startDate: communityEvents.startDate,
        endDate: communityEvents.endDate,
        location: communityEvents.location,
        locationUrl: communityEvents.locationUrl,
        coverImageUrl: communityEvents.coverImageUrl,
        isOnline: communityEvents.isOnline,
        isPublic: communityEvents.isPublic,
        maxAttendees: communityEvents.maxAttendees,
        attendeesCount: communityEvents.attendeesCount,
        registrationRequired: communityEvents.registrationRequired,
        registrationUrl: communityEvents.registrationUrl,
        tags: communityEvents.tags,
        createdAt: communityEvents.createdAt,
        updatedAt: communityEvents.updatedAt,
        organizer: users,
      })
      .from(communityEvents)
      .leftJoin(users, eq(communityEvents.organizerId, users.id))
      .where(eq(communityEvents.id, id));

    if (!result || !result.organizer) return undefined;

    const attendeeCountResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, id));

    return {
      ...result,
      organizer: result.organizer,
      attendeeCount: Number(attendeeCountResult[0]?.count) || 0,
    };
  }

  async createCommunityEvent(event: InsertCommunityEvent): Promise<CommunityEvent> {
    const [newEvent] = await db.insert(communityEvents).values(event).returning();
    
    await this.createActivity({
      userId: event.organizerId,
      activityType: "event_created",
      targetType: "event",
      targetId: newEvent.id,
      metadata: {},
      isPublic: event.isPublic ?? true,
    });
    
    return newEvent;
  }

  async updateCommunityEvent(id: string, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined> {
    const [updated] = await db
      .update(communityEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communityEvents.id, id))
      .returning();
    return updated;
  }

  // Event Attendees operations
  async registerForEvent(eventId: string, userId: string): Promise<EventAttendee> {
    const [attendee] = await db
      .insert(eventAttendees)
      .values({ eventId, userId, status: "registered" })
      .returning();
    
    await db
      .update(communityEvents)
      .set({ attendeesCount: sql`${communityEvents.attendeesCount} + 1` })
      .where(eq(communityEvents.id, eventId));
    
    await this.createActivity({
      userId,
      activityType: "event_registered",
      targetType: "event",
      targetId: eventId,
      metadata: {},
      isPublic: true,
    });
    
    return attendee;
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    await db
      .delete(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    
    await db
      .update(communityEvents)
      .set({ attendeesCount: sql`${communityEvents.attendeesCount} - 1` })
      .where(eq(communityEvents.id, eventId));
  }

  async getEventAttendees(eventId: string): Promise<(EventAttendee & { user: User })[]> {
    const results = await db
      .select({
        id: eventAttendees.id,
        eventId: eventAttendees.eventId,
        userId: eventAttendees.userId,
        status: eventAttendees.status,
        registeredAt: eventAttendees.registeredAt,
        user: users,
      })
      .from(eventAttendees)
      .leftJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(eventAttendees.registeredAt);

    return results.map((r: any) => ({ ...r, user: r.user })) as (EventAttendee & { user: User })[];
  }

  // Activity Feed operations
  async getActivityFeed(userId?: string, limit: number = 50): Promise<(ActivityFeed & { user: User })[]> {
    let query = db
      .select({
        id: activityFeed.id,
        userId: activityFeed.userId,
        activityType: activityFeed.activityType,
        targetType: activityFeed.targetType,
        targetId: activityFeed.targetId,
        metadata: activityFeed.metadata,
        isPublic: activityFeed.isPublic,
        createdAt: activityFeed.createdAt,
        user: users,
      })
      .from(activityFeed)
      .leftJoin(users, eq(activityFeed.userId, users.id))
      .where(eq(activityFeed.isPublic, true))
      .$dynamic();

    if (userId) {
      query = query.where(eq(activityFeed.userId, userId));
    }

    const results = await query
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);

    return results.map((r: any) => ({ ...r, user: r.user })) as (ActivityFeed & { user: User })[];
  }

  async createActivity(activity: Omit<ActivityFeed, "id" | "createdAt">): Promise<ActivityFeed> {
    const [newActivity] = await db.insert(activityFeed).values(activity).returning();
    return newActivity;
  }

  // Notifications operations
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .$dynamic();

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }

    return query.orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    if (!password || !hashedPassword) {
      console.error("verifyPassword: Missing password or hash");
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  } catch (error: any) {
    console.error("Error in verifyPassword:", error);
    throw error;
  }
}

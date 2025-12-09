import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role"), // developer, participant, employer
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const userRoles = ["developer", "participant", "employer"] as const;
export type UserRole = typeof userRoles[number];

// User profile with Career DNA assessment
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  skills: text("skills").array(),
  accessibilityNeeds: text("accessibility_needs").array(),
  preferredJobTypes: text("preferred_job_types").array(),
  preferredLocations: text("preferred_locations").array(),
  careerDnaCompleted: boolean("career_dna_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Career DNA dimensions - categories for the 50+ assessment dimensions
export const careerDimensions = pgTable("career_dimensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // Strengths, Work Environment, Skills, Interests, Values, Accessibility
  description: text("description"),
  questionText: text("question_text").notNull(),
  order: integer("order").default(0),
});

export type CareerDimension = typeof careerDimensions.$inferSelect;

// User's scores for each Career DNA dimension
export const userDimensionScores = pgTable("user_dimension_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dimensionId: varchar("dimension_id").notNull().references(() => careerDimensions.id),
  score: integer("score").notNull(), // 0-100
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserDimensionScoreSchema = createInsertSchema(userDimensionScores).omit({ id: true, updatedAt: true });
export type InsertUserDimensionScore = z.infer<typeof insertUserDimensionScoreSchema>;
export type UserDimensionScore = typeof userDimensionScores.$inferSelect;

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  salary: text("salary"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  accommodations: text("accommodations"),
  postedDate: text("posted_date").notNull(),
  accessibilityFeatures: text("accessibility_features").array(),
  externalId: text("external_id"),
  externalSource: text("external_source"),
  applyUrl: text("apply_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull(),
  appliedDate: text("applied_date").notNull(),
  notes: text("notes"),
  coverLetter: text("cover_letter"),
  resumeId: varchar("resume_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Resumes table
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

// Interview sessions table
export const interviewSessions = pgTable("interview_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobTitle: text("job_title").notNull(),
  questions: text("questions").array().notNull(),
  answers: text("answers").array(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({ id: true, createdAt: true });
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;

// Mentors table for community features
export const mentors = pgTable("mentors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  expertise: text("expertise").array(),
  bio: text("bio"),
  availability: text("availability"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Mentor = typeof mentors.$inferSelect;

// Mentor connections
export const mentorConnections = pgTable("mentor_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => mentors.id),
  menteeUserId: varchar("mentee_user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // pending, accepted, declined
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MentorConnection = typeof mentorConnections.$inferSelect;

// Peer connections for community networking
export const peerConnections = pgTable("peer_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  status: text("status").notNull(), // pending, accepted, declined
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPeerConnectionSchema = createInsertSchema(peerConnections).omit({ id: true, createdAt: true });
export type InsertPeerConnection = z.infer<typeof insertPeerConnectionSchema>;
export type PeerConnection = typeof peerConnections.$inferSelect;

// Messages for community communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Support tickets for help center
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // open, in_progress, resolved, closed
  priority: text("priority").notNull(), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Request/response types for API
export const generateResumeRequestSchema = z.object({
  experience: z.string(),
  skills: z.string(),
  education: z.string(),
  targetRole: z.string(),
});
export type GenerateResumeRequest = z.infer<typeof generateResumeRequestSchema>;

export const generateInterviewQuestionsRequestSchema = z.object({
  jobTitle: z.string(),
  jobDescription: z.string().optional(),
});
export type GenerateInterviewQuestionsRequest = z.infer<typeof generateInterviewQuestionsRequestSchema>;

export const analyzeAnswerRequestSchema = z.object({
  question: z.string(),
  answer: z.string(),
  jobTitle: z.string(),
});
export type AnalyzeAnswerRequest = z.infer<typeof analyzeAnswerRequestSchema>;

export const generateCoverLetterRequestSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  jobDescription: z.string(),
  resumeContent: z.string().optional(),
});
export type GenerateCoverLetterRequest = z.infer<typeof generateCoverLetterRequestSchema>;

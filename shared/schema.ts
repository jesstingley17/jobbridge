import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // full-time, part-time, remote, hybrid
  salary: text("salary"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  accommodations: text("accommodations"), // accessibility accommodations offered
  postedDate: text("posted_date").notNull(),
  accessibilityFeatures: text("accessibility_features").array(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull(), // applied, interviewing, offered, rejected, saved
  appliedDate: text("applied_date").notNull(),
  notes: text("notes"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export const interviewSessions = pgTable("interview_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobTitle: text("job_title").notNull(),
  questions: text("questions").array().notNull(),
  answers: text("answers").array(),
  feedback: text("feedback"),
  createdAt: text("created_at").notNull(),
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({ id: true });
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;

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

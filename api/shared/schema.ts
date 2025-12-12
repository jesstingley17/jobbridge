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

// User storage table (supports both Replit Auth and email/password auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // hashed password for email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role"), // developer, participant, employer
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  monthlyApplicationCount: integer("monthly_application_count").default(0),
  applicationCountResetDate: timestamp("application_count_reset_date").defaultNow(),
  emailVerified: boolean("email_verified").default(false),
  termsAccepted: boolean("terms_accepted").default(false), // Whether user accepted Terms and Conditions
  termsAcceptedAt: timestamp("terms_accepted_at"), // When user accepted Terms
  marketingConsent: boolean("marketing_consent").default(false), // Whether user consented to marketing communications
  marketingConsentAt: timestamp("marketing_consent_at"), // When user consented to marketing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Registration schema for email/password signup (Early Access/Beta)
export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions to join early access",
  }),
  marketingConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to marketing communications to join early access and receive updates",
  }),
});
export type RegisterUser = z.infer<typeof registerUserSchema>;

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginUser = z.infer<typeof loginUserSchema>;

export const userRoles = ["developer", "participant", "employer", "admin"] as const;
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

// Structured resume data types
export const resumeEducationSchema = z.object({
  school: z.string(),
  degree: z.string().optional(),
  major: z.string().optional(),
  gradYear: z.string().optional(),
});
export type ResumeEducation = z.infer<typeof resumeEducationSchema>;

export const resumeExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  dates: z.string().optional(),
  description: z.string().optional(),
});
export type ResumeExperience = z.infer<typeof resumeExperienceSchema>;

export const resumeContactSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
});
export type ResumeContact = z.infer<typeof resumeContactSchema>;

// Resumes table with structured fields
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Structured parsed data
  contactInfo: jsonb("contact_info").$type<ResumeContact>(),
  skills: text("skills").array(),
  education: jsonb("education").$type<ResumeEducation[]>(),
  experience: jsonb("experience").$type<ResumeExperience[]>(),
  isParsed: boolean("is_parsed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

// Resume parsing request schema
export const parseResumeRequestSchema = z.object({
  resumeText: z.string(),
});
export type ParseResumeRequest = z.infer<typeof parseResumeRequestSchema>;

// Bulk apply request schema
export const bulkApplyRequestSchema = z.object({
  jobIds: z.array(z.string()),
  resumeId: z.string().optional(),
});
export type BulkApplyRequest = z.infer<typeof bulkApplyRequestSchema>;

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

// Community Posts (social feed)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(), // Array of image/video URLs
  postType: varchar("post_type").default("post"), // post, question, announcement, job_share
  groupId: varchar("group_id"), // Optional: if post belongs to a group
  forumId: varchar("forum_id"), // Optional: if post belongs to a forum
  isPinned: boolean("is_pinned").default(false),
  isPublic: boolean("is_public").default(true),
  tags: text("tags").array(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true, commentsCount: true, sharesCount: true });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Post Comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentCommentId: varchar("parent_comment_id"), // For nested replies
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true });
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

// Post Reactions (likes, etc.)
export const postReactions = pgTable("post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type").default("like"), // like, love, support, celebrate
  createdAt: timestamp("created_at").defaultNow(),
});

export type PostReaction = typeof postReactions.$inferSelect;

// Community Groups
export const communityGroups = pgTable("community_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  slug: varchar("slug").notNull().unique(),
  coverImageUrl: text("cover_image_url"),
  avatarUrl: text("avatar_url"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  category: varchar("category"), // industry, disability_type, location, interest
  isPublic: boolean("is_public").default(true),
  isPrivate: boolean("is_private").default(false),
  membersCount: integer("members_count").default(0),
  postsCount: integer("posts_count").default(0),
  rules: text("rules"), // Group rules/guidelines
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityGroupSchema = createInsertSchema(communityGroups).omit({ id: true, createdAt: true, updatedAt: true, membersCount: true, postsCount: true });
export type InsertCommunityGroup = z.infer<typeof insertCommunityGroupSchema>;
export type CommunityGroup = typeof communityGroups.$inferSelect;

// Group Members
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => communityGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // member, moderator, admin
  status: varchar("status").default("active"), // active, pending, banned
  joinedAt: timestamp("joined_at").defaultNow(),
});

export type GroupMember = typeof groupMembers.$inferSelect;

// Forums (Discussion Boards)
export const forums = pgTable("forums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  slug: varchar("slug").notNull().unique(),
  category: varchar("category"), // general, career_advice, job_seeking, accessibility, success_stories
  icon: varchar("icon"), // Icon name or emoji
  isPublic: boolean("is_public").default(true),
  topicsCount: integer("topics_count").default(0),
  postsCount: integer("posts_count").default(0),
  lastPostAt: timestamp("last_post_at"),
  lastPostBy: varchar("last_post_by").references(() => users.id),
  order: integer("order").default(0), // Display order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumSchema = createInsertSchema(forums).omit({ id: true, createdAt: true, updatedAt: true, topicsCount: true, postsCount: true });
export type InsertForum = z.infer<typeof insertForumSchema>;
export type Forum = typeof forums.$inferSelect;

// Forum Topics (Discussion Threads)
export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  forumId: varchar("forum_id").notNull().references(() => forums.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  slug: varchar("slug").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewsCount: integer("views_count").default(0),
  repliesCount: integer("replies_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: varchar("last_reply_by").references(() => users.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({ id: true, createdAt: true, updatedAt: true, viewsCount: true, repliesCount: true });
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => forumTopics.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentReplyId: varchar("parent_reply_id"), // For nested replies
  likesCount: integer("likes_count").default(0),
  isSolution: boolean("is_solution").default(false), // Mark as solution/answer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true });
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

// Community Events
export const communityEvents = pgTable("community_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  slug: varchar("slug").notNull().unique(),
  eventType: varchar("event_type"), // networking, workshop, webinar, meetup, conference
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"), // Physical location or "Online"
  locationUrl: text("location_url"), // Zoom, Google Meet, etc.
  coverImageUrl: text("cover_image_url"),
  isOnline: boolean("is_online").default(false),
  isPublic: boolean("is_public").default(true),
  maxAttendees: integer("max_attendees"),
  attendeesCount: integer("attendees_count").default(0),
  registrationRequired: boolean("registration_required").default(false),
  registrationUrl: text("registration_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({ id: true, createdAt: true, updatedAt: true, attendeesCount: true });
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;

// Event Attendees
export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => communityEvents.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("registered"), // registered, attending, attended, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
});

export type EventAttendee = typeof eventAttendees.$inferSelect;

// Activity Feed (user activity stream)
export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type").notNull(), // post_created, comment_added, group_joined, event_registered, connection_made
  targetType: varchar("target_type"), // post, comment, group, event, user
  targetId: varchar("target_id"), // ID of the target entity
  metadata: jsonb("metadata"), // Additional activity data
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // post_like, comment_reply, connection_request, event_reminder, group_invite
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  link: text("link"), // URL to navigate to
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"), // Additional notification data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

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

// AI Feature Request Schemas
export const jobRecommendationsRequestSchema = z.object({
  skills: z.array(z.string()).optional(),
  preferredJobTypes: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
});
export type JobRecommendationsRequest = z.infer<typeof jobRecommendationsRequestSchema>;

export const simplifyJobRequestSchema = z.object({
  jobTitle: z.string(),
  description: z.string(),
  requirements: z.string(),
});
export type SimplifyJobRequest = z.infer<typeof simplifyJobRequestSchema>;

export const skillsGapRequestSchema = z.object({
  currentSkills: z.array(z.string()),
  targetRole: z.string(),
  jobDescription: z.string().optional(),
});
export type SkillsGapRequest = z.infer<typeof skillsGapRequestSchema>;

export const chatAssistantRequestSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});
export type ChatAssistantRequest = z.infer<typeof chatAssistantRequestSchema>;

export const applicationTipsRequestSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  jobDescription: z.string(),
  userSkills: z.array(z.string()).optional(),
});
export type ApplicationTipsRequest = z.infer<typeof applicationTipsRequestSchema>;

export const jobMatchScoreRequestSchema = z.object({
  jobTitle: z.string(),
  jobDescription: z.string(),
  jobRequirements: z.string(),
  userSkills: z.array(z.string()),
  userExperience: z.string().optional(),
});
export type JobMatchScoreRequest = z.infer<typeof jobMatchScoreRequestSchema>;

// Magic link tokens for passwordless authentication
export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMagicLinkTokenSchema = createInsertSchema(magicLinkTokens).omit({ id: true, createdAt: true, used: true });
export type InsertMagicLinkToken = z.infer<typeof insertMagicLinkTokenSchema>;
export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;

// Track if welcome email was sent
// Notes table for Supabase integration
export const notes = pgTable("notes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export const insertNoteSchema = createInsertSchema(notes);

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  emailType: varchar("email_type").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export type EmailLog = typeof emailLogs.$inferSelect;

// Blog posts table (synced from Contentful)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentfulId: varchar("contentful_id").unique(), // Contentful entry ID
  title: text("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  authorName: varchar("author_name").default("The JobBridge Team"),
  featuredImage: text("featured_image"),
  published: boolean("published").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  tags: text("tags").array(),
  views: integer("views").default(0),
  contentfulUpdatedAt: timestamp("contentful_updated_at"), // Track Contentful updates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

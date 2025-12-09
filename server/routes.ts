import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import { z } from "zod";
import { getExternalJobs } from "./externalJobs";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { 
  generateResumeRequestSchema, 
  generateInterviewQuestionsRequestSchema,
  analyzeAnswerRequestSchema,
  insertApplicationSchema,
  generateCoverLetterRequestSchema,
  insertUserProfileSchema,
  jobRecommendationsRequestSchema,
  simplifyJobRequestSchema,
  skillsGapRequestSchema,
  chatAssistantRequestSchema,
  applicationTipsRequestSchema,
  jobMatchScoreRequestSchema
} from "@shared/schema";

const normalizeStringArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map(x => x.trim()).filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.map(x => String(x).trim()).filter(Boolean);
  }
  return [];
}, z.array(z.string()));

const updateProfileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  skills: normalizeStringArray.optional(),
  accessibilityNeeds: normalizeStringArray.optional(),
  preferredJobTypes: normalizeStringArray.optional(),
  preferredLocations: normalizeStringArray.optional(),
  careerDnaCompleted: z.boolean().optional(),
});

const saveScoresSchema = z.object({
  scores: z.array(z.object({
    dimensionId: z.string().min(1),
    score: z.number().min(0).max(100),
  })).min(1, "At least one score is required"),
});

const hasOpenAI = !!(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

const openai = hasOpenAI ? new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
}) : null;

const validStatuses = ["applied", "interviewing", "offered", "rejected", "saved"] as const;
const updateApplicationSchema = z.object({
  status: z.enum(validStatuses).optional(),
  notes: z.string().optional(),
  coverLetter: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Seed initial data on startup
  await storage.seedInitialData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.post('/api/auth/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      if (!["developer", "participant", "employer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid profile data", details: parsed.error.errors });
      }
      
      const existing = await storage.getUserProfile(userId);
      if (existing) {
        const updated = await storage.updateUserProfile(userId, parsed.data);
        res.json(updated);
      } else {
        const profile = await storage.createUserProfile({ ...parsed.data, userId });
        res.status(201).json(profile);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  // Career DNA routes
  app.get('/api/career-dna/dimensions', async (_req, res) => {
    try {
      const dimensions = await storage.getCareerDimensions();
      res.json(dimensions);
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      res.status(500).json({ error: "Failed to fetch career dimensions" });
    }
  });

  app.get('/api/career-dna/scores', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scores = await storage.getUserDimensionScores(userId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  app.post('/api/career-dna/scores', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = saveScoresSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid scores data", details: parsed.error.errors });
      }
      
      await storage.saveUserDimensionScores(userId, parsed.data.scores);
      await storage.updateUserProfile(userId, { careerDnaCompleted: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving scores:", error);
      res.status(500).json({ error: "Failed to save scores" });
    }
  });

  // Jobs endpoints (public)
  app.get("/api/jobs", async (req, res) => {
    try {
      const { query, type, location } = req.query;
      const jobs = await storage.searchJobs(
        query as string | undefined,
        type as string | undefined,
        location as string | undefined
      );
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // External jobs endpoint (from Indeed/RapidAPI with caching)
  app.get("/api/external-jobs", async (req, res) => {
    try {
      const { query, location, type, accessibilityFilters } = req.query;
      const filters = accessibilityFilters ? 
        (typeof accessibilityFilters === 'string' ? accessibilityFilters.split(',') : accessibilityFilters as string[]) 
        : undefined;
      const externalJobs = await getExternalJobs(
        query as string | undefined,
        location as string | undefined,
        type as string | undefined,
        filters
      );
      res.json(externalJobs);
    } catch (error) {
      console.error("Error fetching external jobs:", error);
      res.status(500).json({ error: "Failed to fetch external jobs" });
    }
  });

  // Combined jobs endpoint (internal + external)
  app.get("/api/all-jobs", async (req, res) => {
    try {
      const { query, type, location, accessibilityFilters } = req.query;
      const filters = accessibilityFilters ? 
        (typeof accessibilityFilters === 'string' ? accessibilityFilters.split(',') : accessibilityFilters as string[]) 
        : undefined;
      
      const [internalJobs, externalJobs] = await Promise.all([
        storage.searchJobs(
          query as string | undefined,
          type as string | undefined,
          location as string | undefined,
          filters
        ),
        getExternalJobs(
          query as string | undefined,
          location as string | undefined,
          type as string | undefined,
          filters
        ),
      ]);
      
      const allJobs = [...internalJobs, ...externalJobs];
      res.json(allJobs);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Applications endpoints (protected)
  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertApplicationSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid application data", details: parsed.error });
      }
      const application = await storage.createApplication(parsed.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const parsed = updateApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid update data", details: parsed.error.errors });
      }
      const application = await storage.updateApplication(id, parsed.data);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteApplication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getApplicationStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Mentor endpoints
  app.get("/api/mentors", async (_req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ error: "Failed to fetch mentors" });
    }
  });

  app.post("/api/mentors/connect", isAuthenticated, async (req: any, res) => {
    try {
      const menteeUserId = req.user.claims.sub;
      const { mentorId, message } = req.body;
      
      if (!mentorId) {
        return res.status(400).json({ error: "Mentor ID is required" });
      }
      
      // Verify the mentor exists
      const mentor = await storage.getMentor(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }
      
      const connection = await storage.createMentorConnection(mentorId, menteeUserId, message);
      res.status(201).json(connection);
    } catch (error: any) {
      console.error("Error creating connection:", error);
      if (error.code === "23503") {
        return res.status(400).json({ error: "Invalid mentor or user reference" });
      }
      res.status(500).json({ error: "Failed to create connection" });
    }
  });

  // AI-powered Resume Generation
  app.post("/api/resume/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = generateResumeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { experience, skills, education, targetRole } = parsed.data;
      let resumeContent: string;

      if (openai) {
        const prompt = `You are an expert resume writer specializing in helping job seekers with disabilities create compelling, ATS-friendly resumes. Create a professional resume based on the following information:

Target Role: ${targetRole}

Experience:
${experience}

Skills:
${skills}

Education:
${education}

Please generate a well-structured, professional resume that:
1. Highlights transferable skills and achievements
2. Uses action verbs and quantifiable results where possible
3. Is formatted clearly with sections for Summary, Experience, Skills, and Education
4. Is optimized for Applicant Tracking Systems (ATS)
5. Focuses on abilities and accomplishments

Format the resume in a clean, professional markdown format.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert resume writer who creates accessible, ATS-friendly resumes." },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });

        resumeContent = response.choices[0]?.message?.content || generateMockResume(targetRole, experience, skills, education);
      } else {
        resumeContent = generateMockResume(targetRole, experience, skills, education);
      }

      const resume = await storage.createResume({
        userId,
        title: `Resume for ${targetRole}`,
        content: resumeContent,
      });

      res.json({ resume: resumeContent, id: resume.id });
    } catch (error) {
      console.error("Error generating resume:", error);
      const { targetRole, experience, skills, education } = req.body;
      const fallbackResume = generateMockResume(targetRole || "Professional", experience || "", skills || "", education || "");
      res.json({ resume: fallbackResume, id: "fallback" });
    }
  });

  // AI-powered Cover Letter Generation
  app.post("/api/cover-letter/generate", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = generateCoverLetterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { jobTitle, company, jobDescription, resumeContent } = parsed.data;
      let coverLetter: string;

      if (openai) {
        const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}.

Job Description:
${jobDescription}

${resumeContent ? `Candidate's Resume:\n${resumeContent}` : ''}

Create a compelling cover letter that:
1. Opens with a strong hook
2. Highlights relevant experience and skills
3. Shows enthusiasm for the role and company
4. Addresses how the candidate can contribute
5. Closes with a clear call to action

Keep it professional, concise (3-4 paragraphs), and personalized.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert cover letter writer who creates personalized, compelling letters." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        coverLetter = response.choices[0]?.message?.content || generateMockCoverLetter(jobTitle, company);
      } else {
        coverLetter = generateMockCoverLetter(jobTitle, company);
      }

      res.json({ coverLetter });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      const { jobTitle, company } = req.body;
      res.json({ coverLetter: generateMockCoverLetter(jobTitle || "Position", company || "Company") });
    }
  });

  // AI-powered Interview Question Generation
  app.post("/api/interview/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = generateInterviewQuestionsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { jobTitle, jobDescription } = parsed.data;
      let questions;

      if (openai) {
        try {
          const prompt = `Generate 5 common interview questions for a ${jobTitle} position${jobDescription ? ` with the following job description: ${jobDescription}` : ''}.

For each question, provide:
1. The question itself
2. Why this question is commonly asked
3. Tips for answering effectively

Format as a JSON array with objects containing: question, reason, tips`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an expert career coach. Always return valid JSON." },
              { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content || "[]";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          questions = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockQuestions(jobTitle);
        } catch {
          questions = getMockQuestions(jobTitle);
        }
      } else {
        questions = getMockQuestions(jobTitle);
      }

      const session = await storage.createInterviewSession({
        userId,
        jobTitle,
        questions: questions.map((q: { question: string }) => q.question),
        answers: null,
        feedback: null,
      });

      res.json({ questions, sessionId: session.id });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      const jobTitle = req.body?.jobTitle || "Professional";
      res.json({ questions: getMockQuestions(jobTitle), sessionId: "fallback" });
    }
  });

  // AI-powered Answer Analysis
  app.post("/api/interview/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = analyzeAnswerRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { question, answer, jobTitle } = parsed.data;
      let feedback: string;

      if (openai) {
        try {
          const prompt = `Analyze this interview answer for a ${jobTitle} position:

Question: ${question}
Answer: ${answer}

Provide constructive feedback including:
1. Overall Assessment (1-5 stars)
2. Strengths
3. Areas for improvement
4. Suggestions`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a supportive interview coach." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });

          feedback = response.choices[0]?.message?.content || getMockFeedback(answer);
        } catch {
          feedback = getMockFeedback(answer);
        }
      } else {
        feedback = getMockFeedback(answer);
      }

      res.json({ feedback });
    } catch (error) {
      console.error("Error analyzing answer:", error);
      res.json({ feedback: getMockFeedback(req.body?.answer || "") });
    }
  });

  // AI Job Recommendations
  app.post("/api/ai/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = jobRecommendationsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { skills, preferredJobTypes, preferredLocations } = parsed.data;
      const profile = await storage.getUserProfile(userId);
      const userSkills = skills || profile?.skills || [];
      const jobTypes = preferredJobTypes || profile?.preferredJobTypes || [];
      const locations = preferredLocations || profile?.preferredLocations || [];

      let recommendations;
      if (openai && userSkills.length > 0) {
        try {
          const prompt = `Based on this job seeker profile, suggest 5 job types/roles that would be a good match:

Skills: ${userSkills.join(", ")}
Preferred Job Types: ${jobTypes.join(", ") || "Any"}
Preferred Locations: ${locations.join(", ") || "Any"}

Return a JSON array with objects containing:
- role: the job title/role
- reason: why this is a good match
- searchTerms: array of 2-3 search terms to find these jobs`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a career advisor helping people with disabilities find suitable employment. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content || "[]";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockRecommendations(userSkills);
        } catch {
          recommendations = getMockRecommendations(userSkills);
        }
      } else {
        recommendations = getMockRecommendations(userSkills);
      }

      res.json({ recommendations });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.json({ recommendations: getMockRecommendations([]) });
    }
  });

  // AI Job Description Simplifier
  app.post("/api/ai/simplify-job", async (req, res) => {
    try {
      const parsed = simplifyJobRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { jobTitle, description, requirements } = parsed.data;
      let simplified;

      if (openai) {
        try {
          const prompt = `Simplify this job posting into plain, easy-to-understand language for someone who may have cognitive differences or learning disabilities:

Job Title: ${jobTitle}

Description:
${description}

Requirements:
${requirements}

Please provide:
1. A simple summary of what this job involves (2-3 sentences)
2. Key daily tasks in bullet points
3. Must-have skills (simplified)
4. Nice-to-have skills (simplified)
5. Work environment details

Use simple words and short sentences.`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a helpful assistant that explains job postings in simple, clear language." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });

          simplified = response.choices[0]?.message?.content || getMockSimplifiedJob(jobTitle);
        } catch {
          simplified = getMockSimplifiedJob(jobTitle);
        }
      } else {
        simplified = getMockSimplifiedJob(jobTitle);
      }

      res.json({ simplified });
    } catch (error) {
      console.error("Error simplifying job:", error);
      res.json({ simplified: getMockSimplifiedJob(req.body?.jobTitle || "this job") });
    }
  });

  // AI Skills Gap Analysis
  app.post("/api/ai/skills-gap", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = skillsGapRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { currentSkills, targetRole, jobDescription } = parsed.data;
      let analysis;

      if (openai) {
        try {
          const prompt = `Analyze the skills gap for someone wanting to become a ${targetRole}:

Current Skills: ${currentSkills.join(", ")}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Provide:
1. Skills they already have that are valuable (matching skills)
2. Skills they need to develop (gaps)
3. Recommended learning resources or steps for each gap
4. Estimated time to develop each skill
5. Priority ranking (high/medium/low)

Return as JSON with: matchingSkills (array), skillGaps (array with name, priority, timeToLearn, resources)`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a career development advisor. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content || "{}";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockSkillsGap(currentSkills, targetRole);
        } catch {
          analysis = getMockSkillsGap(currentSkills, targetRole);
        }
      } else {
        analysis = getMockSkillsGap(currentSkills, targetRole);
      }

      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing skills gap:", error);
      res.json({ analysis: getMockSkillsGap([], req.body?.targetRole || "Professional") });
    }
  });

  // AI Chat Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const parsed = chatAssistantRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { message, conversationHistory } = parsed.data;
      let reply;

      if (openai) {
        try {
          const systemPrompt = `You are a helpful AI assistant for The Job Bridge, an employment platform for people with disabilities. 
Your role is to:
- Help users navigate the job search process
- Answer questions about accessibility accommodations
- Provide encouragement and support
- Guide users to platform features (Resume Builder, Interview Prep, Job Search)
- Give practical job hunting advice

Be warm, supportive, and use clear, simple language. Keep responses concise but helpful.`;

          const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
            { role: "system", content: systemPrompt }
          ];
          
          if (conversationHistory) {
            messages.push(...conversationHistory.map(m => ({ role: m.role, content: m.content })));
          }
          messages.push({ role: "user", content: message });

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            max_tokens: 500,
            temperature: 0.8,
          });

          reply = response.choices[0]?.message?.content || getMockChatReply(message);
        } catch {
          reply = getMockChatReply(message);
        }
      } else {
        reply = getMockChatReply(message);
      }

      res.json({ reply });
    } catch (error) {
      console.error("Error in chat:", error);
      res.json({ reply: getMockChatReply(req.body?.message || "") });
    }
  });

  // AI Application Tips
  app.post("/api/ai/application-tips", async (req, res) => {
    try {
      const parsed = applicationTipsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { jobTitle, company, jobDescription, userSkills } = parsed.data;
      let tips;

      if (openai) {
        try {
          const prompt = `Provide 5 specific tips for applying to this position:

Job: ${jobTitle} at ${company}
Description: ${jobDescription}
${userSkills?.length ? `Applicant's Skills: ${userSkills.join(", ")}` : ""}

For each tip, include:
- The tip itself
- Why it matters for this specific role
- An example of how to implement it

Return as JSON array with objects: { tip, importance, example }`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a job application coach. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1200,
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content || "[]";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          tips = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockApplicationTips(jobTitle, company);
        } catch {
          tips = getMockApplicationTips(jobTitle, company);
        }
      } else {
        tips = getMockApplicationTips(jobTitle, company);
      }

      res.json({ tips });
    } catch (error) {
      console.error("Error getting application tips:", error);
      res.json({ tips: getMockApplicationTips(req.body?.jobTitle || "the position", req.body?.company || "the company") });
    }
  });

  // AI Job Match Score
  app.post("/api/ai/match-score", async (req, res) => {
    try {
      const parsed = jobMatchScoreRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { jobTitle, jobDescription, jobRequirements, userSkills, userExperience } = parsed.data;
      let matchResult;

      if (openai && userSkills.length > 0) {
        try {
          const prompt = `Calculate a job match score (0-100) for this candidate:

Job: ${jobTitle}
Job Description: ${jobDescription}
Requirements: ${jobRequirements}

Candidate Skills: ${userSkills.join(", ")}
${userExperience ? `Experience: ${userExperience}` : ""}

Return JSON with:
- score: number 0-100
- matchedSkills: array of skills that match
- missingSkills: array of skills needed
- strengths: brief summary of candidate strengths
- recommendation: brief recommendation for the candidate`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a job matching algorithm. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            max_tokens: 800,
            temperature: 0.5,
          });

          const content = response.choices[0]?.message?.content || "{}";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          matchResult = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockMatchScore(userSkills, jobRequirements);
        } catch {
          matchResult = getMockMatchScore(userSkills, jobRequirements);
        }
      } else {
        matchResult = getMockMatchScore(userSkills, jobRequirements);
      }

      res.json(matchResult);
    } catch (error) {
      console.error("Error calculating match score:", error);
      res.json(getMockMatchScore(req.body?.userSkills || [], req.body?.jobRequirements || ""));
    }
  });

  // Stripe subscription routes
  app.get("/api/stripe/publishable-key", (_req, res) => {
    try {
      const key = getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting Stripe key:", error);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  app.get("/api/stripe/products", async (_req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY pr.unit_amount ASC
      `);
      
      const productsMap = new Map();
      for (const row of result.rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            recurring_interval: row.recurring?.interval || null
          });
        }
      }
      
      res.json({ products: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stripe = getUncachableStripeClient();
      
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId }
        });
        await storage.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/pricing?success=true`,
        cancel_url: `${baseUrl}/pricing?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const stripe = getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/pricing`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      res.json({ 
        tier: user?.subscriptionTier || 'free',
        subscriptionId: user?.stripeSubscriptionId || null,
        customerId: user?.stripeCustomerId || null
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateMockResume(targetRole: string, experience: string, skills: string, education: string): string {
  return `# Professional Resume

## Summary
Dedicated professional seeking a ${targetRole} position with strong skills and experience.

## Experience
${experience || "Professional experience demonstrating strong work ethic and commitment."}

## Skills
${skills || "Strong communication, problem-solving, and teamwork abilities."}

## Education
${education || "Relevant educational background with continuous learning."}

---
*Generated by The Job Bridge AI Resume Builder*`;
}

function generateMockCoverLetter(jobTitle: string, company: string): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and skills, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed expertise that aligns well with this role. I am particularly drawn to ${company}'s commitment to innovation and excellence, and I am excited about the opportunity to contribute to your continued success.

I would welcome the opportunity to discuss how my experience and skills can benefit your organization. Thank you for considering my application.

Sincerely,
[Your Name]`;
}

function getMockQuestions(jobTitle: string): Array<{ question: string; reason: string; tips: string }> {
  return [
    { question: `Tell me about yourself and why you're interested in this ${jobTitle} role.`, reason: "To understand your background", tips: "Keep it relevant to the role" },
    { question: "Describe a challenging project you've handled.", reason: "To assess problem-solving", tips: "Use the STAR method" },
    { question: "How do you prioritize tasks?", reason: "To evaluate time management", tips: "Give specific examples" },
    { question: "Tell me about a time you worked in a team.", reason: "To assess collaboration", tips: "Highlight your contribution" },
    { question: "Where do you see yourself in 5 years?", reason: "To understand your goals", tips: "Align with company opportunities" }
  ];
}

function getMockFeedback(answer: string): string {
  const wordCount = answer.split(/\s+/).length;
  const rating = wordCount > 50 ? 4 : wordCount > 20 ? 3 : 2;
  return `## Overall: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}

### Strengths
- You addressed the question
- Shows engagement

### Areas for Improvement
${wordCount < 50 ? "- Add more specific examples\n" : ""}- Use the STAR method

### Suggestions
- Practice speaking answers aloud
- Prepare adaptable stories

Keep practicing!`;
}

function getMockRecommendations(skills: string[]): Array<{ role: string; reason: string; searchTerms: string[] }> {
  const hasSkills = skills.length > 0;
  return [
    { role: "Customer Service Representative", reason: hasSkills ? `Your skills in ${skills[0] || "communication"} are highly valued` : "Great entry point for many careers", searchTerms: ["customer service", "support specialist", "client relations"] },
    { role: "Data Entry Specialist", reason: "Remote-friendly with flexible hours", searchTerms: ["data entry", "administrative assistant", "virtual assistant"] },
    { role: "Content Writer", reason: "Creative role with work-from-home options", searchTerms: ["content writer", "copywriter", "blog writer"] },
    { role: "Quality Assurance Tester", reason: "Detail-oriented work with growing demand", searchTerms: ["QA tester", "software tester", "quality analyst"] },
    { role: "Administrative Assistant", reason: "Versatile role with transferable skills", searchTerms: ["admin assistant", "office coordinator", "executive assistant"] }
  ];
}

function getMockSimplifiedJob(jobTitle: string): string {
  return `## What This Job Is About
This ${jobTitle} position involves helping the team with daily tasks and projects.

## What You'll Do Each Day
- Complete assigned tasks and projects
- Work with team members
- Communicate with others as needed
- Learn new skills on the job

## Skills You Need
- Good communication (talking and writing)
- Basic computer skills
- Ability to follow instructions
- Willingness to learn

## Nice to Have
- Previous work experience
- Knowledge of the industry

## Work Environment
The workplace is supportive and offers accommodations as needed.`;
}

function getMockSkillsGap(currentSkills: string[], targetRole: string): { matchingSkills: string[]; skillGaps: Array<{ name: string; priority: string; timeToLearn: string; resources: string[] }> } {
  return {
    matchingSkills: currentSkills.slice(0, 3),
    skillGaps: [
      { name: "Communication Skills", priority: "high", timeToLearn: "1-2 months", resources: ["Online courses", "Practice with peers"] },
      { name: "Technical Proficiency", priority: "medium", timeToLearn: "2-3 months", resources: ["YouTube tutorials", "Free online courses"] },
      { name: "Industry Knowledge", priority: "medium", timeToLearn: "1-2 months", resources: ["Industry blogs", "Professional associations"] }
    ]
  };
}

function getMockChatReply(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("resume")) {
    return "I'd be happy to help with your resume! Head over to our Resume Builder section where you can use AI to create a professional resume tailored to your target role. Would you like tips on what to include?";
  }
  if (lowerMessage.includes("interview")) {
    return "Interview preparation is key! Check out our Interview Prep section where you can practice with AI-generated questions and get feedback on your answers. Want some general interview tips?";
  }
  if (lowerMessage.includes("job") || lowerMessage.includes("work")) {
    return "Finding the right job takes time. Use our Job Search to find disability-friendly employers. You can filter by accessibility features like remote work, flexible hours, and workplace accommodations.";
  }
  return "I'm here to help you on your job search journey! I can assist with resumes, interview prep, finding accessible jobs, or navigating the platform. What would you like help with?";
}

function getMockApplicationTips(jobTitle: string, company: string): Array<{ tip: string; importance: string; example: string }> {
  return [
    { tip: "Customize your resume for this role", importance: `Tailoring shows ${company} you're genuinely interested`, example: "Match keywords from the job description in your skills section" },
    { tip: "Research the company culture", importance: "Shows you're a good fit beyond just skills", example: `Look up ${company}'s mission statement and values` },
    { tip: "Highlight relevant achievements", importance: "Demonstrates your potential impact", example: "Use numbers to quantify your past accomplishments" },
    { tip: "Prepare for common questions", importance: "Confidence in interviews comes from preparation", example: `Practice explaining why you want to work at ${company}` },
    { tip: "Follow up after applying", importance: "Shows initiative and genuine interest", example: "Send a brief follow-up email after one week" }
  ];
}

function getMockMatchScore(userSkills: string[], jobRequirements: string): { score: number; matchedSkills: string[]; missingSkills: string[]; strengths: string; recommendation: string } {
  const score = Math.min(Math.max(30 + userSkills.length * 10, 40), 85);
  return {
    score,
    matchedSkills: userSkills.slice(0, 3),
    missingSkills: ["Industry experience", "Specific certifications"],
    strengths: userSkills.length > 0 ? `Strong foundation in ${userSkills[0]}` : "Enthusiasm and willingness to learn",
    recommendation: score > 60 ? "You're a good match! Apply with confidence." : "Consider developing additional skills to strengthen your application."
  };
}

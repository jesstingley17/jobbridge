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
  insertUserProfileSchema
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

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import { 
  generateResumeRequestSchema, 
  generateInterviewQuestionsRequestSchema,
  analyzeAnswerRequestSchema,
  insertApplicationSchema
} from "@shared/schema";

const hasOpenAI = !!(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

const openai = hasOpenAI ? new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
}) : null;

const validStatuses = ["applied", "interviewing", "offered", "rejected", "saved"] as const;
const updateApplicationSchema = z.object({
  status: z.enum(validStatuses).optional(),
  notes: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Jobs endpoints
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

  // Applications endpoints
  app.get("/api/applications", async (_req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const parsed = insertApplicationSchema.safeParse(req.body);
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

  app.patch("/api/applications/:id", async (req, res) => {
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

  app.delete("/api/applications/:id", async (req, res) => {
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

  // AI-powered Resume Generation
  app.post("/api/resume/generate", async (req, res) => {
    try {
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
            { 
              role: "system", 
              content: "You are an expert resume writer who creates accessible, ATS-friendly resumes. Focus on strengths, skills, and accomplishments." 
            },
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
        title: `Resume for ${targetRole}`,
        content: resumeContent,
        createdAt: new Date().toISOString(),
      });

      res.json({ resume: resumeContent, id: resume.id });
    } catch (error) {
      console.error("Error generating resume:", error);
      const { targetRole, experience, skills, education } = req.body;
      const fallbackResume = generateMockResume(targetRole || "Professional", experience || "", skills || "", education || "");
      res.json({ resume: fallbackResume, id: "fallback" });
    }
  });

  // AI-powered Interview Question Generation
  app.post("/api/interview/questions", async (req, res) => {
    try {
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

Format as a JSON array with objects containing: question, reason, tips

The questions should cover:
- Behavioral questions
- Technical/role-specific questions
- Problem-solving scenarios
- Questions about teamwork and collaboration
- Questions about handling challenges

Be inclusive and consider that candidates may have various backgrounds and experiences.`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are an expert career coach helping job seekers prepare for interviews. Provide helpful, encouraging, and practical interview preparation advice. Always return valid JSON." 
              },
              { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content || "[]";
          
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            questions = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockQuestions(jobTitle);
          } catch {
            questions = getMockQuestions(jobTitle);
          }
        } catch {
          questions = getMockQuestions(jobTitle);
        }
      } else {
        questions = getMockQuestions(jobTitle);
      }

      const session = await storage.createInterviewSession({
        jobTitle,
        questions: questions.map((q: { question: string }) => q.question),
        answers: null,
        feedback: null,
        createdAt: new Date().toISOString(),
      });

      res.json({ questions, sessionId: session.id });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      const jobTitle = req.body?.jobTitle || "Professional";
      const questions = getMockQuestions(jobTitle);
      res.json({ questions, sessionId: "fallback" });
    }
  });

  // AI-powered Answer Analysis
  app.post("/api/interview/analyze", async (req, res) => {
    try {
      const parsed = analyzeAnswerRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { question, answer, jobTitle } = parsed.data;

      let feedback: string;

      if (openai) {
        try {
          const prompt = `As an expert interview coach, analyze this interview answer for a ${jobTitle} position:

Question: ${question}

Candidate's Answer: ${answer}

Please provide constructive feedback including:
1. Overall Assessment (1-5 stars)
2. Strengths of the answer
3. Areas for improvement
4. Suggested improvements or additions
5. Example of how to enhance the answer

Be encouraging and supportive while providing actionable feedback. Consider that candidates may have different communication styles and experiences.`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are a supportive interview coach who provides constructive, encouraging feedback. Focus on helping candidates improve while acknowledging their strengths." 
              },
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

  return httpServer;
}

function generateMockResume(targetRole: string, experience: string, skills: string, education: string): string {
  return `# Professional Resume

## Summary
Dedicated and motivated professional seeking a ${targetRole} position. Brings a unique combination of skills, experience, and passion for excellence to every role.

## Experience
${experience || "Professional experience demonstrating strong work ethic, adaptability, and commitment to achieving goals."}

## Skills
${skills || "Strong communication, problem-solving, and teamwork abilities. Quick learner with attention to detail."}

## Education
${education || "Relevant educational background with continuous learning and professional development."}

---
*This resume was generated by The Job Bridge AI Resume Builder*`;
}

function getMockQuestions(jobTitle: string): Array<{ question: string; reason: string; tips: string }> {
  return [
    { 
      question: `Tell me about yourself and why you're interested in this ${jobTitle} role.`, 
      reason: "To understand your background and motivation", 
      tips: "Keep it relevant to the role and highlight your key strengths" 
    },
    { 
      question: "Describe a challenging project you've worked on and how you handled it.", 
      reason: "To assess problem-solving and resilience", 
      tips: "Use the STAR method: Situation, Task, Action, Result" 
    },
    { 
      question: "How do you prioritize tasks when you have multiple deadlines?", 
      reason: "To evaluate time management skills", 
      tips: "Give specific examples of tools or methods you use" 
    },
    { 
      question: "Tell me about a time you worked effectively as part of a team.", 
      reason: "To assess collaboration and communication skills", 
      tips: "Highlight your specific contribution and the team's success" 
    },
    { 
      question: "Where do you see yourself growing professionally in the next few years?", 
      reason: "To understand your career goals and ambition", 
      tips: "Align your goals with opportunities at the company" 
    }
  ];
}

function getMockFeedback(answer: string): string {
  const wordCount = answer.split(/\s+/).length;
  const rating = wordCount > 50 ? 4 : wordCount > 20 ? 3 : 2;
  
  return `## Overall Assessment: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}

### Strengths
- You provided a response that addresses the question
- Your answer shows engagement with the topic
${wordCount > 30 ? "- Good level of detail in your response" : ""}

### Areas for Improvement
${wordCount < 50 ? "- Consider providing more specific examples or details" : ""}
- Try using the STAR method (Situation, Task, Action, Result) for behavioral questions
- Include quantifiable achievements when possible

### Suggestions
- Practice speaking your answers out loud to improve fluency
- Prepare 2-3 stories that can be adapted to different questions
- Remember to highlight how your unique experiences add value

Keep practicing! Every interview is an opportunity to learn and improve.`;
}

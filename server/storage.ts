import { 
  type User, type InsertUser,
  type Job, type InsertJob,
  type Application, type InsertApplication,
  type Resume, type InsertResume,
  type InterviewSession, type InsertInterviewSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  searchJobs(query?: string, type?: string, location?: string): Promise<Job[]>;
  
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;
  
  getResumes(): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  
  getInterviewSessions(): Promise<InterviewSession[]>;
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private applications: Map<string, Application>;
  private resumes: Map<string, Resume>;
  private interviewSessions: Map<string, InterviewSession>;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.resumes = new Map();
    this.interviewSessions = new Map();
    
    this.seedJobs();
    this.seedApplications();
  }

  private seedJobs() {
    const sampleJobs: Job[] = [
      {
        id: "job-1",
        title: "Software Engineer",
        company: "TechAccess Inc",
        location: "Remote",
        type: "full-time",
        salary: "$90,000 - $120,000",
        description: "Join our inclusive team building accessible web applications. We value diverse perspectives and provide comprehensive accommodations for all team members.",
        requirements: "3+ years of experience with React, TypeScript, and Node.js. Experience with accessibility standards (WCAG) is a plus.",
        accommodations: "Flexible hours, screen reader compatible tools, sign language interpreters available, ergonomic equipment provided",
        postedDate: "2024-12-01",
        accessibilityFeatures: ["Screen reader compatible", "Flexible hours", "Remote work", "Ergonomic equipment"]
      },
      {
        id: "job-2",
        title: "UX Designer",
        company: "Inclusive Design Co",
        location: "New York, NY",
        type: "hybrid",
        salary: "$85,000 - $110,000",
        description: "Help us create beautiful, accessible user experiences. Our design team specializes in inclusive design principles and we welcome designers with disabilities.",
        requirements: "2+ years UX design experience. Proficiency in Figma or Sketch. Understanding of accessibility principles.",
        accommodations: "Accessible office space, flexible schedule, assistive technology provided, quiet workspace available",
        postedDate: "2024-12-03",
        accessibilityFeatures: ["Accessible office", "Quiet workspace", "Assistive technology", "Flexible schedule"]
      },
      {
        id: "job-3",
        title: "Customer Success Manager",
        company: "AccessAbility Solutions",
        location: "Chicago, IL",
        type: "full-time",
        salary: "$70,000 - $90,000",
        description: "Build relationships with our clients and ensure their success with our accessibility tools. We prioritize hiring individuals with lived disability experience.",
        requirements: "Strong communication skills. Experience in customer service or account management. Passion for accessibility.",
        accommodations: "Wheelchair accessible office, service animals welcome, captioning services, modified work schedules",
        postedDate: "2024-12-05",
        accessibilityFeatures: ["Wheelchair accessible", "Service animals welcome", "Captioning services", "Modified schedules"]
      },
      {
        id: "job-4",
        title: "Data Analyst",
        company: "EqualOpp Analytics",
        location: "Remote",
        type: "remote",
        salary: "$75,000 - $95,000",
        description: "Analyze data to drive insights for our clients. We provide all necessary accommodations and support a fully remote, accessible work environment.",
        requirements: "Experience with SQL, Python, and data visualization tools. Strong analytical skills. Attention to detail.",
        accommodations: "100% remote, flexible hours, accessible software tools, regular check-ins, mental health support",
        postedDate: "2024-12-06",
        accessibilityFeatures: ["100% Remote", "Flexible hours", "Accessible tools", "Mental health support"]
      },
      {
        id: "job-5",
        title: "Marketing Coordinator",
        company: "Diverse Voices Media",
        location: "Los Angeles, CA",
        type: "part-time",
        salary: "$25 - $35/hour",
        description: "Coordinate marketing campaigns that celebrate diversity and inclusion. Part-time position with potential for full-time for the right candidate.",
        requirements: "Marketing or communications background. Social media management experience. Creative mindset.",
        accommodations: "Flexible part-time hours, accessible building, parking accommodations, work from home days",
        postedDate: "2024-12-07",
        accessibilityFeatures: ["Part-time flexible", "Accessible building", "Parking accommodations", "Hybrid option"]
      },
      {
        id: "job-6",
        title: "Technical Writer",
        company: "DocuAccess",
        location: "Remote",
        type: "remote",
        salary: "$65,000 - $85,000",
        description: "Create clear, accessible documentation for software products. We use accessible authoring tools and provide training on inclusive writing practices.",
        requirements: "Excellent written communication. Experience with technical documentation. Familiarity with accessibility guidelines.",
        accommodations: "Remote work, voice dictation software, flexible deadlines, accessible document templates",
        postedDate: "2024-12-08",
        accessibilityFeatures: ["Remote work", "Voice dictation", "Flexible deadlines", "Accessible templates"]
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  private seedApplications() {
    const sampleApplications: Application[] = [
      {
        id: "app-1",
        jobId: "job-1",
        jobTitle: "Software Engineer",
        company: "TechAccess Inc",
        status: "interviewing",
        appliedDate: "2024-12-02",
        notes: "Had a great initial phone screen. Technical interview scheduled for next week."
      },
      {
        id: "app-2",
        jobId: "job-2",
        jobTitle: "UX Designer",
        company: "Inclusive Design Co",
        status: "applied",
        appliedDate: "2024-12-05",
        notes: "Submitted portfolio and resume. Waiting to hear back."
      },
      {
        id: "app-3",
        jobId: "job-4",
        jobTitle: "Data Analyst",
        company: "EqualOpp Analytics",
        status: "saved",
        appliedDate: "2024-12-08",
        notes: "Saving for later. Need to update resume first."
      }
    ];

    sampleApplications.forEach(app => this.applications.set(app.id, app));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async searchJobs(query?: string, type?: string, location?: string): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (type && type !== "all") {
      jobs = jobs.filter(job => job.type === type);
    }
    
    if (location && location !== "all") {
      if (location === "remote") {
        jobs = jobs.filter(job => job.location.toLowerCase() === "remote");
      } else {
        jobs = jobs.filter(job => job.location.toLowerCase() !== "remote");
      }
    }
    
    return jobs;
  }

  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = { ...insertApp, id };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    const existing = this.applications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.applications.set(id, updated);
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    return this.applications.delete(id);
  }

  async getResumes(): Promise<Resume[]> {
    return Array.from(this.resumes.values());
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = randomUUID();
    const resume: Resume = { ...insertResume, id };
    this.resumes.set(id, resume);
    return resume;
  }

  async getInterviewSessions(): Promise<InterviewSession[]> {
    return Array.from(this.interviewSessions.values());
  }

  async createInterviewSession(insertSession: InsertInterviewSession): Promise<InterviewSession> {
    const id = randomUUID();
    const session: InterviewSession = { ...insertSession, id };
    this.interviewSessions.set(id, session);
    return session;
  }

  async updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | undefined> {
    const existing = this.interviewSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.interviewSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

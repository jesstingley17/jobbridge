import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { isAuthenticated, isAdmin } from "./auth.js";
import { blockBots } from "./botid.js";
import { requireSupabaseAuth } from "./middleware/supabaseAuth.js";
import OpenAI from "openai";
import { z } from "zod";
import { getExternalJobs } from "./externalJobs.js";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient.js";
import { sql, eq } from "drizzle-orm";
import { db } from "./db.js";
import { postComments } from "../shared/schema.js";
import { requireFeature, requireApplicationQuota, incrementApplicationCount, getUserSubscriptionStatus } from "./subscriptionMiddleware.js";
import { sendMagicLinkEmail, sendPasswordResetEmail } from "./email.js";
import crypto from "crypto";
import { generateAIText, getAIClient } from "./aiGateway.js";
import { 
  fetchContentfulPosts, 
  fetchContentfulPostBySlug, 
  convertContentfulPostToDbFormat,
  syncContentfulPosts,
  upsertContentfulPost,
  deleteContentfulPost
} from "./contentful.js";
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
  jobMatchScoreRequestSchema,
  parseResumeRequestSchema,
  bulkApplyRequestSchema,
  registerUserSchema,
  loginUserSchema
} from "../shared/schema.js";
import { hashPassword, verifyPassword } from "./storage.js";
import { sendWelcomeEmail } from "./email.js";

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

// Support both Vercel AI Gateway and direct OpenAI
// Priority: AI Gateway > Direct OpenAI
const aiClient = getAIClient();
const hasOpenAI = !!aiClient;

// Legacy OpenAI client for backward compatibility
const openai = aiClient && aiClient.type === 'openai' ? aiClient.client : null;

// Helper to get model name (adds prefix for AI Gateway)
function getModelName(baseModel: string = 'gpt-4o'): string {
  if (aiClient?.type === 'gateway') {
    // AI Gateway uses prefixed model names
    return `openai/${baseModel}`;
  }
  return baseModel;
}

// Wrapper function to handle both AI Gateway and OpenAI
async function createChatCompletion(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { max_tokens?: number; temperature?: number }
) {
  if (aiClient?.type === 'gateway') {
    // Use AI Gateway via AI SDK
    const result = await generateAIText(
      getModelName(model),
      messages,
      {
        maxTokens: options?.max_tokens,
        temperature: options?.temperature,
      }
    );
    return {
      choices: [{
        message: { content: result.text },
        finish_reason: result.finishReason,
      }],
      usage: result.usage,
    };
  } else if (openai) {
    // Use direct OpenAI SDK
    return await openai.chat.completions.create({
      model,
      messages: messages as any,
      max_tokens: options?.max_tokens,
      temperature: options?.temperature,
    });
  }
  throw new Error('No AI client available');
}

const validStatuses = ["applied", "interviewing", "offered", "rejected", "saved"] as const;
const updateApplicationSchema = z.object({
  status: z.enum(validStatuses).optional(),
  notes: z.string().optional(),
  coverLetter: z.string().optional(),
});

import { registerSitemapRoute } from "./routes/sitemap.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: Session middleware should be set up BEFORE calling registerRoutes
  // (e.g., in api/index.ts for Vercel or server/index.ts for regular server)
  // We don't set it up here to avoid duplicate middleware in serverless functions
  
  // Register sitemap and robots.txt routes (before auth)
  registerSitemapRoute(app);
  
  // Site manifest route (must be before static file serving)
  app.get("/site.webmanifest", (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.json({
      name: "The JobBridge",
      short_name: "JobBridge",
      description: "AI-powered employment platform for people with disabilities",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: []
    });
  });
  
  // Supabase user sync endpoint - called after Supabase signup
  app.post('/api/auth/sync-supabase-user', async (req, res) => {
    try {
      const { supabaseUserId, email, firstName, lastName, termsAccepted, marketingConsent, emailVerified } = req.body;
      
      if (!supabaseUserId || !email) {
        return res.status(400).json({ error: 'Missing required fields: supabaseUserId and email are required' });
      }

      console.log('Syncing Supabase user:', { supabaseUserId, email, firstName, lastName });

      // CRITICAL: Check if a user with this email already exists (from beta signup, newsletter, etc.)
      const existingUserByEmail = await storage.getUserByEmail(email);
      
      if (existingUserByEmail) {
        // User exists with different ID - merge by updating ID to Supabase ID
        if (existingUserByEmail.id !== supabaseUserId) {
          console.log(`Merging user: Found existing user ${existingUserByEmail.id} for email ${email}, updating to Supabase ID ${supabaseUserId}`);
          
          // Update the existing user's ID to Supabase ID and merge data
          // This requires a special merge operation since we can't directly change primary key
          // We'll need to handle this carefully to avoid conflicts
          try {
            // First, check if Supabase ID already exists (shouldn't happen, but safety check)
            const existingSupabaseUser = await storage.getUser(supabaseUserId);
            
            if (existingSupabaseUser) {
              // Supabase ID already exists - this is a conflict
              console.warn(`Both email-based user (${existingUserByEmail.id}) and Supabase user (${supabaseUserId}) exist for ${email}`);
              // Use the Supabase user as canonical, but merge data
              const mergedUser = await storage.upsertUser({
                id: supabaseUserId,
                email,
                firstName: firstName || existingUserByEmail.firstName || null,
                lastName: lastName || existingUserByEmail.lastName || null,
                emailVerified: emailVerified ?? existingUserByEmail.emailVerified ?? false,
                termsAccepted: termsAccepted ?? existingUserByEmail.termsAccepted ?? false,
                marketingConsent: marketingConsent ?? existingUserByEmail.marketingConsent ?? false,
                role: existingUserByEmail.role || null,
                stripeCustomerId: existingUserByEmail.stripeCustomerId || null,
                stripeSubscriptionId: existingUserByEmail.stripeSubscriptionId || null,
                subscriptionTier: existingUserByEmail.subscriptionTier || null,
              });
              
              // Delete the old user record (optional - you may want to keep it for audit)
              // For now, we'll just use the Supabase ID as canonical
              console.log('Using Supabase user as canonical:', mergedUser.id);
              res.json({ user: mergedUser, success: true, merged: true });
              return;
            }
            
            // No Supabase user exists - we need to merge by updating the existing user
            // Since we can't change primary key, we'll create a new user with Supabase ID
            // and mark the old one for deletion (or handle via a migration)
            const mergedUser = await storage.upsertUser({
              id: supabaseUserId,
              email,
              firstName: firstName || existingUserByEmail.firstName || null,
              lastName: lastName || existingUserByEmail.lastName || null,
              emailVerified: emailVerified ?? existingUserByEmail.emailVerified ?? false,
              termsAccepted: termsAccepted ?? existingUserByEmail.termsAccepted ?? false,
              marketingConsent: marketingConsent ?? existingUserByEmail.marketingConsent ?? false,
              role: existingUserByEmail.role || null,
              stripeCustomerId: existingUserByEmail.stripeCustomerId || null,
              stripeSubscriptionId: existingUserByEmail.stripeSubscriptionId || null,
              subscriptionTier: existingUserByEmail.subscriptionTier || null,
            });
            
            // TODO: Migrate related records (applications, profiles, etc.) from old ID to new ID
            // For now, we'll log a warning
            console.warn(`User merged: Old ID ${existingUserByEmail.id} -> New ID ${supabaseUserId}. Related records may need migration.`);
            
            res.json({ user: mergedUser, success: true, merged: true, oldId: existingUserByEmail.id });
            return;
          } catch (mergeError: any) {
            console.error('Error merging users:', mergeError);
            // Fall through to regular upsert
          }
        } else {
          // Same ID - just update
          const user = await storage.upsertUser({
            id: supabaseUserId,
            email,
            firstName: firstName || existingUserByEmail.firstName || null,
            lastName: lastName || existingUserByEmail.lastName || null,
            emailVerified: emailVerified ?? existingUserByEmail.emailVerified ?? false,
            termsAccepted: termsAccepted ?? existingUserByEmail.termsAccepted ?? false,
            marketingConsent: marketingConsent ?? existingUserByEmail.marketingConsent ?? false,
          });
          res.json({ user, success: true });
          return;
        }
      }

      // No existing user - create new with Supabase ID
      const user = await storage.upsertUser({
        id: supabaseUserId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        emailVerified: emailVerified ?? false,
        termsAccepted: termsAccepted || false,
        marketingConsent: marketingConsent || false,
      });

      console.log('Successfully synced user:', user.id);
      res.json({ user, success: true });
    } catch (error: any) {
      console.error('Error syncing Supabase user:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      });
      
      // Check if it's a database table error
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return res.status(500).json({ 
          error: 'Database not initialized',
          message: 'Database tables do not exist. Please run migrations.',
          details: error.message
        });
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to sync user',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // Auth is handled by Supabase - no setup needed

  // Seed initial data on startup
  // Seed data removed - using real job search API

  // Google OAuth callback handler
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      // Supabase handles OAuth validation client-side
      // This endpoint is optional for any additional server-side processing
      res.json({ message: 'Google OAuth token received' });
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ message: 'Google authentication failed' });
    }
  });

  // Google OAuth callback handler
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      // Supabase handles OAuth validation client-side
      // This endpoint is optional for any additional server-side processing
      res.json({ message: 'Google OAuth token received' });
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ message: 'Google authentication failed' });
    }
  });

  // Email/password registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      let existingUser;
      try {
        existingUser = await storage.getUserByEmail(validatedData.email);
      } catch (dbError: any) {
        // If it's a "relation does not exist" error, the database tables haven't been created
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist') || dbError.message?.includes('relation')) {
          console.error("Database tables not found. Please run migrations:", dbError.message);
          return res.status(500).json({ 
            message: "Database not initialized. Please run database migrations.",
            error: "Database tables do not exist. Run: npm run db:push or execute migrations/create_community_tables.sql"
          });
        }
        throw dbError; // Re-throw other database errors
      }
      
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      let user;
      try {
        user = await storage.createUserWithPassword({
          ...validatedData,
          hashedPassword
        });
      } catch (createError: any) {
        // Check if it's a database table error
        if (createError.code === '42P01' || createError.message?.includes('does not exist') || createError.message?.includes('relation')) {
          console.error("Database tables not found during user creation:", createError.message);
          return res.status(500).json({ 
            message: "Database not initialized. Please run database migrations.",
            error: "Database tables do not exist. Run: npm run db:push or execute migrations/create_community_tables.sql"
          });
        }
        throw createError; // Re-throw other errors
      }
      
      // Send welcome email
      try {
        await sendWelcomeEmail({ email: user.email!, firstName: user.firstName || undefined });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      
      // Create session - store user data in session for traditional auth
      try {
        if (req.session) {
          (req.session as any).userId = user.id;
          (req.session as any).user = {
            claims: { sub: user.id }
          };
        }
      } catch (sessionError) {
        console.warn("Failed to set session, continuing without session:", sessionError);
        // Continue even if session setup fails
      }
      
      res.status(201).json({ 
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      // Provide more detailed error message for debugging
      const errorMessage = error.message || "Registration failed";
      res.status(500).json({ 
        message: "Registration failed",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  // Email/password login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValid = await verifyPassword(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        claims: { sub: user.id }
      };
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin login (separate from regular auth)
  // Note: blockBots removed temporarily to improve login speed
  // BotID protection is still active via client-side initBotId()
  app.post('/api/admin/login', async (req, res) => {
    try {
      // Validate request body
      if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user by email (optimized: single query)
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password) {
        // Use same error message to prevent user enumeration
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password (fast bcrypt comparison)
      const isValid = await verifyPassword(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if user is admin (via email check or role)
      const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
      const adminPattern = process.env.ADMIN_EMAIL_PATTERN;
      let isAdmin = false;
      
      if (user.role === "admin") {
        isAdmin = true;
      } else if (user.email && adminEmails.includes(user.email)) {
        isAdmin = true;
      } else if (adminPattern && user.email) {
        try {
          const regex = new RegExp(adminPattern);
          if (regex.test(user.email)) {
            isAdmin = true;
          }
        } catch (regexError) {
          console.error("Invalid ADMIN_EMAIL_PATTERN regex:", regexError);
        }
      }
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Create session (check if session exists)
      try {
        if (req.session) {
          (req.session as any).userId = user.id;
          (req.session as any).user = {
            claims: { sub: user.id }
          };
          (req.session as any).isAdmin = true;
        } else {
          console.warn('Session not available for admin login - session middleware may not be configured');
          // Still allow login but warn about session
        }
      } catch (sessionError: any) {
        console.error("Session creation error:", sessionError);
        // Don't fail login if session fails - user can still authenticate via token
      }
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      console.error("Admin login error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Login failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        details: process.env.NODE_ENV === 'development' ? {
          name: error?.name,
          stack: error?.stack
        } : undefined
      });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Admin logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin forgot password
  app.post('/api/admin/forgot-password', async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      // Check if user exists and is admin
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: "If an admin account exists with this email, you will receive a reset link shortly." });
      }
      
      // Check if user is admin
      const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
      const adminPattern = process.env.ADMIN_EMAIL_PATTERN;
      let isAdmin = false;
      
      if (user.role === "admin") {
        isAdmin = true;
      } else if (user.email && adminEmails.includes(user.email)) {
        isAdmin = true;
      } else if (adminPattern && user.email) {
        const regex = new RegExp(adminPattern);
        if (regex.test(user.email)) {
          isAdmin = true;
        }
      }
      
      if (!isAdmin) {
        // Don't reveal if email exists or not
        return res.json({ message: "If an admin account exists with this email, you will receive a reset link shortly." });
      }
      
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      await storage.createMagicLinkToken(email, token, expiresAt);
      
      // Build reset link URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const resetLink = `${baseUrl}/auth/verify?token=${token}&type=reset`;
      
      // Send password reset email
      const sent = await sendPasswordResetEmail({ 
        email, 
        firstName: user.firstName || undefined, 
        magicLink: resetLink 
      });
      
      if (sent) {
        await storage.logEmail(user.id, email, 'password_reset');
      }
      
      res.json({ message: "If an admin account exists with this email, you will receive a reset link shortly." });
    } catch (error) {
      console.error("Error sending admin password reset:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      res.status(500).json({ error: "Failed to send reset email" });
    }
  });

  // Auth routes - use JWT verification middleware
  app.get('/api/auth/user', requireSupabaseAuth(), async (req: any, res) => {
    try {
      // JWT has been verified by middleware, user info is in req.supabaseUser
      const supabaseUser = req.supabaseUser;
      
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Fast path: Try to get user from database first (most common case)
      // Add timeout to prevent hanging
      let user;
      try {
        const getUserPromise = storage.getUser(supabaseUser.id);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 3000); // 3 second timeout
        });
        
        user = await Promise.race([getUserPromise, timeoutPromise]) as any;
        
        // If user exists, return immediately (fast path)
        if (user) {
          return res.json(user);
        }
      } catch (timeoutError: any) {
        if (timeoutError.message === 'Database query timeout') {
          console.error('Database getUser timed out for user:', supabaseUser.id);
          return res.status(500).json({ 
            error: 'Database timeout',
            message: 'Database query took too long. Please try again.'
          });
        }
        // If it's not a timeout, continue to create user
      }
      
      // User doesn't exist - create with minimal data from JWT (no external API calls)
      // This is much faster than calling Supabase admin API
      if (supabaseUser.email) {
        try {
          const upsertPromise = storage.upsertUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            firstName: null,
            lastName: null,
            emailVerified: false,
            termsAccepted: false,
            marketingConsent: false,
          });
          const upsertTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Upsert timeout')), 3000);
          });
          
          user = await Promise.race([upsertPromise, upsertTimeout]);
          return res.json(user);
        } catch (upsertError: any) {
          console.error('Error creating user:', upsertError);
          
          // Check for timeout
          if (upsertError.message === 'Upsert timeout') {
            // Try to get user one more time (might have been created by another request)
            try {
              const retryPromise = storage.getUser(supabaseUser.id);
              const retryTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Retry timeout')), 2000);
              });
              user = await Promise.race([retryPromise, retryTimeout]);
              if (user) {
                return res.json(user);
              }
            } catch (retryError) {
              // Ignore retry errors
            }
            
            return res.status(500).json({ 
              error: 'Database operation timeout',
              message: 'Database query took too long. Please try again.'
            });
          }
          
          // Check for database errors
          if (upsertError.code === '42P01' || upsertError.message?.includes('does not exist')) {
            return res.status(500).json({ 
              error: 'Database not initialized',
              message: 'Database tables do not exist. Please run migrations.'
            });
          }
          
          // For other errors, try to get user one more time (might have been created by another request)
          try {
            const retryPromise = storage.getUser(supabaseUser.id);
            const retryTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Retry timeout')), 2000);
            });
            user = await Promise.race([retryPromise, retryTimeout]);
            if (user) {
              return res.json(user);
            }
          } catch (retryError) {
            // Ignore retry errors
          }
          
          return res.status(500).json({ 
            error: 'Failed to create user',
            message: upsertError?.message || 'Database error'
          });
        }
      }
      
      // If we still don't have a user, return 401
      return res.status(401).json({ error: 'User not found' });
    } catch (error: any) {
      console.error("Unexpected error in /api/auth/user:", error);
      
      // Check if it's a known error type
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Database not initialized',
          message: 'Database tables do not exist. Please run migrations.',
          code: error.code
        });
      }
      
      // For other unexpected errors, return 500 with details
      res.status(500).json({ 
        message: "Failed to fetch user", 
        error: error.message || 'Internal server error',
        code: error.code
      });
    }
  });

  // Get subscription status
  // Note: blockBots removed - BotID is disabled in client code
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const status = await getUserSubscriptionStatus(userId);
      res.json(status);
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name
      });
      // Return default status instead of 500 to prevent UI breakage
      res.json({
        tier: 'free',
        limits: { applications: 0, aiFeatures: false },
        applicationQuota: {
          used: 0,
          remaining: 0,
          limit: 0,
          resetDate: new Date().toISOString(),
        },
      });
    }
  });

  // Update user role
  app.post('/api/auth/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      if (!["developer", "participant", "employer", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // Magic link / password reset routes
  const magicLinkRequestSchema = z.object({
    email: z.string().email(),
    type: z.enum(['login', 'reset']).default('login'),
  });

  app.post('/api/auth/magic-link', async (req, res) => {
    try {
      const { email, type } = magicLinkRequestSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: "If an account exists with this email, you will receive a link shortly." });
      }
      
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      await storage.createMagicLinkToken(email, token, expiresAt);
      
      // Build magic link URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const magicLink = `${baseUrl}/auth/verify?token=${token}&type=${type}`;
      
      // Send email based on type
      let sent = false;
      if (type === 'reset') {
        sent = await sendPasswordResetEmail({ email, firstName: user.firstName || undefined, magicLink });
      } else {
        sent = await sendMagicLinkEmail({ email, firstName: user.firstName || undefined, magicLink });
      }
      
      if (sent) {
        await storage.logEmail(user.id, email, type === 'reset' ? 'password_reset' : 'magic_link');
      }
      
      res.json({ message: "If an account exists with this email, you will receive a link shortly." });
    } catch (error) {
      console.error("Error sending magic link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  app.get('/api/auth/verify-token', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ valid: false, error: "Token is required" });
      }
      
      const magicToken = await storage.getMagicLinkToken(token);
      
      if (!magicToken) {
        return res.json({ valid: false, error: "Invalid token" });
      }
      
      if (magicToken.used) {
        return res.json({ valid: false, error: "Token has already been used" });
      }
      
      if (new Date() > magicToken.expiresAt) {
        return res.json({ valid: false, error: "Token has expired" });
      }
      
      // Get user info
      const user = await storage.getUserByEmail(magicToken.email);
      
      res.json({ 
        valid: true, 
        email: magicToken.email,
        firstName: user?.firstName || null 
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ valid: false, error: "Failed to verify token" });
    }
  });

  app.post('/api/auth/use-magic-link', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, error: "Token is required" });
      }
      
      const magicToken = await storage.getMagicLinkToken(token);
      
      if (!magicToken) {
        return res.status(400).json({ success: false, error: "Invalid token" });
      }
      
      if (magicToken.used) {
        return res.status(400).json({ success: false, error: "Token has already been used" });
      }
      
      if (new Date() > magicToken.expiresAt) {
        return res.status(400).json({ success: false, error: "Token has expired" });
      }
      
      // Mark token as used
      await storage.markMagicLinkTokenUsed(token);
      
      // Get user and log them in
      const user = await storage.getUserByEmail(magicToken.email);
      
      if (!user) {
        return res.status(400).json({ success: false, error: "User not found" });
      }
      
      // Create session for the user
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        claims: { sub: user.id }
      };
      
      // Mark email as verified
      await storage.verifyUserEmail(user.email!);
      
      res.json({ 
        success: true, 
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("Error using magic link:", error);
      res.status(500).json({ success: false, error: "Failed to use magic link" });
    }
  });

  // Reset password (after receiving magic link)
  const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      
      const magicToken = await storage.getMagicLinkToken(token);
      
      if (!magicToken) {
        return res.status(400).json({ success: false, error: "Invalid token" });
      }
      
      if (magicToken.used) {
        return res.status(400).json({ success: false, error: "Token has already been used" });
      }
      
      if (new Date() > magicToken.expiresAt) {
        return res.status(400).json({ success: false, error: "Token has expired" });
      }
      
      // Get user
      const user = await storage.getUserByEmail(magicToken.email);
      if (!user) {
        return res.status(400).json({ success: false, error: "User not found" });
      }
      
      // Hash and update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Mark token as used
      await storage.markMagicLinkTokenUsed(token);
      
      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        claims: { sub: user.id }
      };
      
      res.json({ 
        success: true, 
        message: "Password reset successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: error.errors[0].message });
      }
      res.status(500).json({ success: false, error: "Failed to reset password" });
    }
  });

  // User profile routes
  app.get('/api/profile', requireSupabaseAuth(), async (req: any, res) => {
    try {
      const supabaseUser = req.supabaseUser;
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const userId = supabaseUser.id;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', requireSupabaseAuth(), async (req: any, res) => {
    try {
      const supabaseUser = req.supabaseUser;
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const userId = supabaseUser.id;
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

  // Beta tester signup (no authentication required)
  app.post('/api/beta-tester/signup', async (req, res) => {
    try {
      const { email, firstName, lastName, company, role, feedback, termsAccepted, marketingConsent } = req.body;
      
      // Basic validation
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, first name, and last name are required" });
      }
      
      if (!termsAccepted) {
        return res.status(400).json({ error: "You must accept the terms and conditions" });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        // User already exists - update their info if needed
        if (marketingConsent !== undefined || firstName || lastName) {
          await storage.updateUser(existingUser.id, {
            firstName: firstName || existingUser.firstName || null,
            lastName: lastName || existingUser.lastName || null,
            marketingConsent: marketingConsent ?? existingUser.marketingConsent ?? false,
            marketingConsentAt: marketingConsent ? new Date() : existingUser.marketingConsentAt || null,
            termsAccepted: existingUser.termsAccepted || true,
            termsAcceptedAt: existingUser.termsAcceptedAt || new Date(),
          });
        }
        return res.json({ 
          success: true, 
          message: "You're already registered! We'll keep you updated.",
          alreadyRegistered: true,
          user: existingUser
        });
      }
      
      // Check if user exists in Supabase Auth (they may have signed up via Supabase first)
      // If so, use their Supabase ID; otherwise, let database generate one
      // Note: We can't check Supabase Auth directly here, so we'll create with auto-generated ID
      // The sync-supabase-user endpoint will handle merging if they sign up via Supabase later
      try {
        const user = await storage.upsertUser({
          email,
          firstName,
          lastName,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          marketingConsent: marketingConsent || false,
          marketingConsentAt: marketingConsent ? new Date() : null,
          // Mark as beta tester in role or add a note
          role: "participant", // Default role
        });
        
        // Send welcome email for beta testers
        try {
          const { sendWelcomeEmail } = await import('./email.js');
          await sendWelcomeEmail({ 
            email: user.email!, 
            firstName: user.firstName || undefined 
          });
        } catch (emailError) {
          console.error("Failed to send beta tester welcome email:", emailError);
          // Don't fail the request if email fails
        }
        
        return res.json({ 
          success: true, 
          message: "Thank you for joining our beta program! We'll be in touch soon.",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        });
      } catch (createError: any) {
        console.error("Error creating beta tester:", createError);
        return res.status(500).json({ 
          error: "Failed to process beta tester signup",
          message: createError?.message || "Database error"
        });
      }
    } catch (error: any) {
      console.error("Error in beta tester signup:", error);
      res.status(500).json({ 
        error: "Failed to process signup",
        message: error?.message || "Internal server error"
      });
    }
  });

  // Newsletter signup (no authentication required)
  app.post('/api/newsletter/signup', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        // User exists - update their marketing consent
        // Using updateUser for app-specific fields (Supabase best practice)
        try {
          await storage.updateUser(existingUser.id, {
            marketingConsent: true,
            marketingConsentAt: new Date(),
          });
          // Return existing user
          return res.json({
            success: true,
            message: "Thank you for subscribing to our newsletter!",
            user: existingUser,
          });
          return res.json({ 
            success: true, 
            message: "You're already subscribed! We'll keep you updated.",
            alreadySubscribed: true
          });
        } catch (updateError) {
          console.error("Error updating user marketing consent:", updateError);
          // Continue to return success even if update fails
          return res.json({ 
            success: true, 
            message: "Thank you for subscribing!",
            alreadySubscribed: true
          });
        }
      }
      
      // Create new user with just email and marketing consent
      try {
        const user = await storage.upsertUser({
          email,
          marketingConsent: true,
          marketingConsentAt: new Date(),
          termsAccepted: false, // They haven't accepted terms yet, just newsletter
        });
        
        return res.json({ 
          success: true, 
          message: "Thank you for subscribing to our newsletter!",
          user: {
            id: user.id,
            email: user.email,
          }
        });
      } catch (createError: any) {
        console.error("Error creating newsletter subscriber:", createError);
        return res.status(500).json({ 
          error: "Failed to process newsletter signup",
          message: createError?.message || "Database error"
        });
      }
    } catch (error: any) {
      console.error("Error in newsletter signup:", error);
      res.status(500).json({ 
        error: "Failed to process signup",
        message: error?.message || "Internal server error"
      });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message, type } = req.body;
      
      // Basic validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Name, email, subject, and message are required" });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      // In a real application, you would:
      // 1. Send an email notification to your team
      // 2. Store the message in a database
      // 3. Send an auto-reply to the user
      
      // For now, we'll just log it and return success
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        message,
        type: type || "general",
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Implement email sending service (e.g., SendGrid, Resend, etc.)
      // TODO: Store in database if needed
      
      return res.json({ 
        success: true, 
        message: "Thank you for contacting us! We'll get back to you within 24-48 hours."
      });
    } catch (error: any) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ 
        error: "Failed to process contact form",
        message: error?.message || "Internal server error"
      });
    }
  });

  // Update community username
  app.patch('/api/user/community-username', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username } = req.body;
      
      // Validate username (optional, can be null to clear it)
      if (username !== null && username !== undefined) {
        if (typeof username !== 'string') {
          return res.status(400).json({ error: "Username must be a string" });
        }
        // Basic validation: alphanumeric, underscore, hyphen, 3-30 chars
        if (username.length < 3 || username.length > 30) {
          return res.status(400).json({ error: "Username must be between 3 and 30 characters" });
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          return res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
        }
      }
      
      const updated = await storage.updateUserCommunityUsername(userId, username || null);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ user: updated });
    } catch (error: any) {
      console.error("Error updating community username:", error);
      res.status(500).json({ error: "Failed to update community username" });
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

  app.post("/api/applications", isAuthenticated, requireApplicationQuota(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertApplicationSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid application data", details: parsed.error });
      }
      const application = await storage.createApplication(parsed.data);
      
      // Increment application count after successful creation
      await incrementApplicationCount(userId);
      
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
    } catch (error: any) {
      console.error("Error fetching mentors:", error);
      console.error("Error stack:", error.stack);
      // Check if it's a database table error
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return res.status(500).json({ 
          error: "Database not initialized",
          message: "Mentors table does not exist. Please run migrations."
        });
      }
      res.status(500).json({ 
        error: "Failed to fetch mentors",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

  // AI-powered Resume Generation (Pro+ feature)
  app.post("/api/resume/generate", isAuthenticated, requireFeature('aiResumeBuilder'), async (req: any, res) => {
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

        const response = await createChatCompletion(
          "gpt-4o",
          [
            { role: "system", content: "You are an expert resume writer who creates accessible, ATS-friendly resumes." },
            { role: "user", content: prompt }
          ],
          {
            max_tokens: 2000,
            temperature: 0.7,
          }
        );

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

  // AI-powered Resume Parsing (Pro+ feature)
  app.post("/api/resume/parse", isAuthenticated, requireFeature('aiResumeParsing'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = parseResumeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { resumeText } = parsed.data;
      let parsedData: {
        contactInfo: { name: string; email?: string; phone?: string; linkedin?: string; portfolio?: string };
        skills: string[];
        education: { school: string; degree?: string; major?: string; gradYear?: string }[];
        experience: { company: string; title: string; dates?: string; description?: string }[];
      };

      if (openai) {
        const prompt = `Parse the following resume text and extract structured data. Return a JSON object with these fields:
- contactInfo: { name (required), email, phone, linkedin, portfolio }
- skills: array of skill strings
- education: array of { school (required), degree, major, gradYear }
- experience: array of { company (required), title (required), dates, description }

Resume text:
${resumeText}

Return ONLY valid JSON, no markdown or explanation.`;

        const response = await createChatCompletion(
          "gpt-4o",
          [
            { role: "system", content: "You are a resume parser. Extract structured data from resumes and return valid JSON only." },
            { role: "user", content: prompt }
          ],
          {
            max_tokens: 2000,
            temperature: 0.3,
          }
        );

        const content = response.choices[0]?.message?.content || "{}";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockParsedResume(resumeText);
      } else {
        parsedData = getMockParsedResume(resumeText);
      }

      const resume = await storage.createResume({
        userId,
        title: `Parsed Resume - ${parsedData.contactInfo?.name || "Unknown"}`,
        content: resumeText,
        contactInfo: parsedData.contactInfo,
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        experience: parsedData.experience || [],
        isParsed: true,
      });

      res.json({ resume, parsedData });
    } catch (error) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ error: "Failed to parse resume" });
    }
  });

  // Update resume with structured data
  app.patch("/api/resume/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      
      const updated = await storage.updateResume(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ error: "Failed to update resume" });
    }
  });

  // Get single resume
  app.get("/api/resume/:id", isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  // Get user's resumes
  app.get("/api/resumes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resumes = await storage.getResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  });

  // Bulk apply to multiple jobs (Pro+ feature)
  app.post("/api/applications/bulk", blockBots, isAuthenticated, requireFeature('bulkApply'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = bulkApplyRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error });
      }

      const { jobIds, resumeId } = parsed.data;
      const results: { jobId: string; success: boolean; applicationId?: string; error?: string }[] = [];
      
      for (const jobId of jobIds) {
        try {
          const job = await storage.getJob(jobId);
          if (!job) {
            results.push({ jobId, success: false, error: "Job not found" });
            continue;
          }

          const application = await storage.createApplication({
            userId,
            jobId,
            jobTitle: job.title,
            company: job.company,
            status: "applied",
            appliedDate: new Date().toISOString().split('T')[0],
            resumeId: resumeId || null,
          });

          results.push({ jobId, success: true, applicationId: application.id });
        } catch (err: any) {
          results.push({ jobId, success: false, error: err.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      res.json({ 
        results, 
        summary: { total: jobIds.length, success: successCount, failed: jobIds.length - successCount }
      });
    } catch (error) {
      console.error("Error bulk applying:", error);
      res.status(500).json({ error: "Failed to bulk apply" });
    }
  });

  // AI-powered Cover Letter Generation (Pro+ feature)
  app.post("/api/cover-letter/generate", blockBots, isAuthenticated, requireFeature('aiCoverLetter'), async (req: any, res) => {
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

        const response = await createChatCompletion(
          "gpt-4o",
          [
            { role: "system", content: "You are an expert cover letter writer who creates personalized, compelling letters." },
            { role: "user", content: prompt }
          ],
          {
            max_tokens: 1000,
            temperature: 0.7,
          }
        );

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

  // AI-powered Interview Question Generation (Pro+ feature)
  app.post("/api/interview/questions", isAuthenticated, requireFeature('aiInterviewPrep'), async (req: any, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are an expert career coach. Always return valid JSON." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 2000,
              temperature: 0.7,
            }
          );

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

  // AI-powered Answer Analysis (Pro+ feature)
  app.post("/api/interview/analyze", blockBots, isAuthenticated, requireFeature('aiInterviewPrep'), async (req: any, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a supportive interview coach." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 1000,
              temperature: 0.7,
            }
          );

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

  // AI Job Recommendations (Pro+ feature)
  app.post("/api/ai/recommendations", isAuthenticated, requireFeature('aiJobRecommendations'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = jobRecommendationsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { skills, preferredJobTypes, preferredLocations } = parsed.data;
      const profile = await storage.getUserProfile(userId);
      
      // Get skills from user's resumes for enhanced matching
      const userResumes = await storage.getResumes(userId);
      const resumeSkills = userResumes
        .filter(r => r.isParsed && r.skills)
        .flatMap(r => r.skills || []);
      
      // Combine and deduplicate skills from profile and resumes
      const allSkills = Array.from(new Set([
        ...(skills || []),
        ...(profile?.skills || []),
        ...resumeSkills
      ]));
      
      const userSkills = allSkills.length > 0 ? allSkills : [];
      const jobTypes = preferredJobTypes || profile?.preferredJobTypes || [];
      const locations = preferredLocations || profile?.preferredLocations || [];
      
      // Extract experience info from resumes
      const resumeExperiences = userResumes
        .filter(r => r.isParsed && r.experience)
        .flatMap(r => r.experience || [])
        .map(exp => `${exp.title} at ${exp.company}`)
        .slice(0, 5);

      let recommendations;
      if (openai && (userSkills.length > 0 || resumeExperiences.length > 0)) {
        try {
          const prompt = `Based on this job seeker profile, suggest 5 job types/roles that would be a good match:

Skills: ${userSkills.join(", ") || "Not specified"}
${resumeExperiences.length > 0 ? `Work Experience: ${resumeExperiences.join("; ")}` : ""}
Preferred Job Types: ${jobTypes.join(", ") || "Any"}
Preferred Locations: ${locations.join(", ") || "Any"}

Return a JSON array with objects containing:
- role: the job title/role
- reason: why this is a good match (consider their skills AND past experience)
- searchTerms: array of 2-3 search terms to find these jobs`;

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a career advisor helping people with disabilities find suitable employment. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 1000,
              temperature: 0.7,
            }
          );

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
  app.post("/api/ai/simplify-job", blockBots, async (req, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a helpful assistant that explains job postings in simple, clear language." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 1000,
              temperature: 0.7,
            }
          );

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

  // AI Skills Gap Analysis (Pro+ feature)
  app.post("/api/ai/skills-gap", blockBots, isAuthenticated, requireFeature('aiSkillsGap'), async (req: any, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a career development advisor. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 1500,
              temperature: 0.7,
            }
          );

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

  // AI Chat Assistant (Pro+ feature)
  app.post("/api/ai/chat", isAuthenticated, requireFeature('aiChatAssistant'), async (req: any, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            messages,
            {
              max_tokens: 500,
              temperature: 0.8,
            }
          );

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

  // AI Application Tips (Pro+ feature)
  app.post("/api/ai/application-tips", blockBots, isAuthenticated, requireFeature('aiApplicationTips'), async (req: any, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a job application coach. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 1200,
              temperature: 0.7,
            }
          );

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
  app.post("/api/ai/match-score", blockBots, async (req, res) => {
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

          const response = await createChatCompletion(
            "gpt-4o",
            [
              { role: "system", content: "You are a job matching algorithm. Return valid JSON only." },
              { role: "user", content: prompt }
            ],
            {
              max_tokens: 800,
              temperature: 0.5,
            }
          );

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
      const stripe = getUncachableStripeClient();
      
      // Fetch products and prices directly from Stripe API
      const [products, prices] = await Promise.all([
        stripe.products.list({ active: true }),
        stripe.prices.list({ active: true })
      ]);
      
      // Group prices by product
      const pricesByProduct = new Map();
      for (const price of prices.data) {
        if (price.product && typeof price.product === 'string') {
          if (!pricesByProduct.has(price.product)) {
            pricesByProduct.set(price.product, []);
          }
          pricesByProduct.get(price.product).push({
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring: price.recurring ? {
              interval: price.recurring.interval,
              interval_count: price.recurring.interval_count
            } : null,
            recurring_interval: price.recurring?.interval || null
          });
        }
      }
      
      // Map products with their prices
      const productsWithPrices = products.data
        .map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          metadata: product.metadata,
          prices: pricesByProduct.get(product.id) || []
        }))
        .filter(product => product.prices.length > 0) // Only return products with active prices
        .sort((a, b) => {
          // Sort by lowest price
          const aPrice = a.prices[0]?.unit_amount || 0;
          const bPrice = b.prices[0]?.unit_amount || 0;
          return aPrice - bPrice;
        });
      
      res.json({ products: productsWithPrices });
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

      const baseUrl = process.env.CLIENT_URL || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` || 'http://localhost:5000';
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

  app.post("/api/stripe/portal", blockBots, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const stripe = getUncachableStripeClient();
      const baseUrl = process.env.CLIENT_URL || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` || 'http://localhost:5000';
      
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

  // Supabase Notes API routes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json({ notes });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      const note = await storage.createNote({ title });
      res.status(201).json({ note });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNote(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Admin route to list Stripe customers
  app.get("/api/stripe/customers", isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getUncachableStripeClient();
      const customers = await stripe.customers.list({
        limit: 100, // Adjust limit as needed
      });
      res.json({ customers: customers.data });
    } catch (error: any) {
      console.error("Error listing Stripe customers:", error);
      res.status(500).json({ error: error.message || "Failed to list customers" });
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

  // Blog API routes (Contentful integration)
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const tag = req.query.tag as string | undefined;
      
      // Sync from Contentful in background (non-blocking)
      syncContentfulPosts(storage.upsertBlogPost.bind(storage))
        .then(({ synced, errors }) => {
          if (synced > 0 || errors > 0) {
            console.log(`Contentful sync: ${synced} synced, ${errors} errors`);
          }
        })
        .catch(err => console.error("Contentful sync error:", err));
      
      // Return posts from database
      const posts = await storage.getBlogPosts(search, tag);
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Try to get from database first
      let post = await storage.getBlogPostBySlug(slug);
      
      // If not found, try to fetch from Contentful and sync
      if (!post) {
        const contentfulPost = await fetchContentfulPostBySlug(slug);
        if (contentfulPost) {
          const dbPost = convertContentfulPostToDbFormat(contentfulPost);
          post = await storage.upsertBlogPost(dbPost);
        }
      }
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Increment views
      await storage.incrementBlogPostViews(slug);
      post.views = (post.views || 0) + 1;
      
      res.json({ post });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Contentful webhook endpoint for automatic sync
  app.post("/api/contentful/webhook", async (req, res) => {
    try {
      // Verify webhook secret if configured
      const webhookSecret = process.env.CONTENTFUL_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers['x-contentful-signature'];
        if (signature !== webhookSecret) {
          return res.status(401).json({ error: "Unauthorized" });
        }
      }

      const { sys, fields } = req.body;
      
      // Only process blog post entries
      if (sys?.contentType?.sys?.id === 'blogPost') {
        const contentfulPost = {
          sys: {
            id: sys.id,
            createdAt: sys.createdAt,
            updatedAt: sys.updatedAt,
          },
          fields: fields || {},
        };
        
        const dbPost = convertContentfulPostToDbFormat(contentfulPost as any);
        await storage.upsertBlogPost(dbPost);
        
        console.log(`Synced blog post from Contentful: ${dbPost.slug}`);
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing Contentful webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Test Contentful connection endpoint (admin only) - block bots
  app.get("/api/contentful/test", blockBots, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { fetchContentfulPosts, getContentfulClient, getContentfulManagementClient } = await import("./contentful.js");
      
      // Check configuration
      const spaceId = process.env.CONTENTFUL_SPACE_ID;
      const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
      const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
      const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

      const diagnostics: any = {
        configured: false,
        spaceId: spaceId ? `${spaceId.substring(0, 8)}...` : 'NOT SET',
        environment,
        hasAccessToken: !!accessToken,
        hasManagementToken: !!managementToken,
        accessTokenLength: accessToken?.length || 0,
        managementTokenLength: managementToken?.length || 0,
        errors: [],
        warnings: [],
        contentTypes: [],
        blogPosts: [],
        testResults: {}
      };

      // Check if configured
      if (!spaceId || !accessToken) {
        diagnostics.errors.push("Missing required environment variables");
        diagnostics.errors.push(`CONTENTFUL_SPACE_ID: ${spaceId ? 'SET' : 'MISSING'}`);
        diagnostics.errors.push(`CONTENTFUL_ACCESS_TOKEN: ${accessToken ? 'SET' : 'MISSING'}`);
        return res.status(400).json({
          error: "Contentful not configured",
          diagnostics,
          message: "Set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN environment variables in Vercel"
        });
      }

      diagnostics.configured = true;

      // Test Content Delivery API (CDA)
      const client = getContentfulClient();
      if (!client) {
        diagnostics.errors.push("Failed to create Contentful client");
        return res.status(500).json({
          error: "Failed to initialize Contentful client",
          diagnostics
        });
      }

      try {
        // Test basic connection
        const entries = await client.getEntries({ limit: 10 });
        diagnostics.testResults.cdaConnection = "SUCCESS";
        diagnostics.totalEntries = entries.total;
        
        // Get all content types
        const contentTypeIds = entries.items.map((item: any) => item.sys.contentType.sys.id);
        diagnostics.contentTypes = [...new Set(contentTypeIds)];
        
        // Try to fetch blog posts
        const posts = await fetchContentfulPosts();
        diagnostics.testResults.fetchPosts = posts.length > 0 ? "SUCCESS" : "NO_POSTS_FOUND";
        diagnostics.blogPosts = posts.map((p: any) => ({
          id: p.sys.id,
          title: p.fields?.title || 'No title',
          slug: p.fields?.slug || 'No slug',
          contentType: p.sys.contentType.sys.id
        }));

        if (posts.length === 0) {
          diagnostics.warnings.push("No blog posts found. Check content type name matches: blogPost, blog_post, Blog page, or blogPage");
          diagnostics.warnings.push(`Available content types: ${diagnostics.contentTypes.join(', ')}`);
        }

        // Test Management API if token is available
        if (managementToken) {
          try {
            const mgmtClient = getContentfulManagementClient();
            if (mgmtClient) {
              const space = await mgmtClient.getSpace(spaceId);
              const env = await space.getEnvironment(environment);
              diagnostics.testResults.managementApi = "SUCCESS";
              diagnostics.spaceName = space.name;
              diagnostics.environmentName = env.name;
            }
          } catch (mgmtError: any) {
            diagnostics.testResults.managementApi = "FAILED";
            diagnostics.warnings.push(`Management API error: ${mgmtError.message}`);
          }
        } else {
          diagnostics.warnings.push("CONTENTFUL_MANAGEMENT_TOKEN not set - cannot create/update posts from admin panel");
        }

        res.json({
          success: true,
          message: diagnostics.errors.length === 0 ? "Contentful connection successful" : "Contentful connected with warnings",
          diagnostics
        });
      } catch (apiError: any) {
        diagnostics.testResults.cdaConnection = "FAILED";
        diagnostics.errors.push(`API Error: ${apiError.message}`);
        
        // Check for specific error types
        if (apiError.message?.includes('401') || apiError.message?.includes('Unauthorized')) {
          diagnostics.errors.push("Invalid access token - check CONTENTFUL_ACCESS_TOKEN");
        } else if (apiError.message?.includes('404') || apiError.message?.includes('Not Found')) {
          diagnostics.errors.push("Space not found - check CONTENTFUL_SPACE_ID");
        } else if (apiError.message?.includes('Network')) {
          diagnostics.errors.push("Network error - check internet connection");
        }

        res.status(500).json({
          error: "Contentful API error",
          diagnostics,
          message: apiError.message,
          details: process.env.NODE_ENV === 'development' ? apiError.stack : undefined
        });
      }
    } catch (error: any) {
      console.error("Error testing Contentful connection:", error);
      res.status(500).json({
        error: "Failed to test Contentful connection",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Manual sync endpoint (admin only)
  app.post("/api/contentful/sync", blockBots, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const result = await syncContentfulPosts(storage.upsertBlogPost.bind(storage));
      res.json({ 
        success: true, 
        synced: result.synced, 
        errors: result.errors,
        message: result.errors > 0 
          ? `Synced ${result.synced} posts with ${result.errors} errors. Check server logs for details.`
          : `Successfully synced ${result.synced} posts from Contentful.`
      });
    } catch (error: any) {
      console.error("Error syncing Contentful posts:", error);
      // Provide more helpful error message
      const errorMessage = error.message || "Failed to sync posts";
      const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('CONTENTFUL');
      
      res.status(500).json({ 
        error: "Failed to sync posts",
        details: isConfigError 
          ? "Contentful may not be configured. Check CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN environment variables."
          : errorMessage,
        synced: 0,
        errors: 1
      });
    }
  });


  // Admin blog management routes - block bots
  app.get("/api/admin/blog/posts", blockBots, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Double-check authentication
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      try {
        const posts = await storage.getAllBlogPosts();
        res.json({ posts });
      } catch (dbError: any) {
        // Database errors - return empty array instead of 500 to prevent UI breakage
        console.error("Database error fetching blog posts:", dbError);
        res.json({ posts: [] });
      }
    } catch (error: any) {
      // This should rarely happen if middleware works correctly
      console.error("Error in admin blog posts endpoint:", error);
      // Return 401 instead of 500 for auth-related errors
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('authentication')) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // For other errors, return empty array to prevent UI breakage
      res.json({ posts: [] });
    }
  });

  app.get("/api/admin/blog/posts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPostById(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ post });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/admin/blog/posts", blockBots, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, slug, excerpt, content, authorName, featuredImage, featuredImageAltText, published, tags, publishedAt, syncToContentful } = req.body;
      
      if (!title || !slug || !content) {
        return res.status(400).json({ error: "Title, slug, and content are required" });
      }

      const post = await storage.upsertBlogPost({
        title,
        slug,
        excerpt,
        content,
        authorName: authorName || "The JobBridge Team",
        featuredImage,
        featuredImageAltText,
        published: published !== false,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      });

      // Optionally sync to Contentful if requested and CMA is configured
      if (syncToContentful) {
        try {
          const contentfulResult = await upsertContentfulPost({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || undefined,
            content: post.content,
            featuredImage: post.featuredImage || undefined,
            published: post.published ?? false,
            tags: post.tags || undefined,
            authorName: post.authorName || undefined,
            publishedAt: post.publishedAt || undefined,
          }, post.published);

          if (contentfulResult) {
            // Update post with contentfulId if it was created
            if (contentfulResult.id && !post.contentfulId) {
              await storage.updateBlogPost(post.id, { contentfulId: contentfulResult.id });
              post.contentfulId = contentfulResult.id;
            }
          }
        } catch (contentfulError: any) {
          console.error("Error syncing to Contentful (post still saved to database):", contentfulError);
          // Don't fail the request if Contentful sync fails - post is still saved
        }
      }

      res.status(201).json({ post });
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "A post with this slug already exists" });
      }
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/posts/:id", blockBots, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, slug, excerpt, content, authorName, featuredImage, published, tags, publishedAt, syncToContentful } = req.body;

      const existingPost = await storage.getBlogPostById(id);
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (slug !== undefined) updates.slug = slug;
      if (excerpt !== undefined) updates.excerpt = excerpt || undefined;
      if (content !== undefined) updates.content = content;
      if (authorName !== undefined) updates.authorName = authorName || undefined;
      if (featuredImage !== undefined) updates.featuredImage = featuredImage || undefined;
      if (featuredImageAltText !== undefined) updates.featuredImageAltText = featuredImageAltText || undefined;
      if (published !== undefined) updates.published = published ?? false;
      if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : tags ? [tags] : undefined;
      if (publishedAt !== undefined) updates.publishedAt = publishedAt ? new Date(publishedAt) : undefined;

      const updated = await storage.updateBlogPost(id, updates);
      if (!updated) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Optionally sync to Contentful if requested and CMA is configured
      if (syncToContentful && existingPost.contentfulId) {
        try {
          await upsertContentfulPost({
            contentfulId: existingPost.contentfulId,
            title: updated.title,
            slug: updated.slug,
            excerpt: updated.excerpt,
            content: updated.content,
            featuredImage: updated.featuredImage,
            published: updated.published,
            tags: updated.tags,
            authorName: updated.authorName,
            publishedAt: updated.publishedAt,
          }, updated.published);
        } catch (contentfulError: any) {
          console.error("Error syncing to Contentful (post still updated in database):", contentfulError);
          // Don't fail the request if Contentful sync fails - post is still updated
        }
      }

      res.json({ post: updated });
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "A post with this slug already exists" });
      }
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/posts/:id", blockBots, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      // For DELETE requests, body might be empty, so we check both body and query
      const syncToContentful = req.body?.syncToContentful || req.query?.syncToContentful === 'true';

      const existingPost = await storage.getBlogPostById(id);
      
      // Optionally delete from Contentful if requested and CMA is configured
      if (syncToContentful && existingPost?.contentfulId) {
        try {
          await deleteContentfulPost(existingPost.contentfulId);
        } catch (contentfulError: any) {
          console.error("Error deleting from Contentful (post still deleted from database):", contentfulError);
          // Don't fail the request if Contentful delete fails - post is still deleted from DB
        }
      }

      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // ==================== COMMUNITY ROUTES ====================
  
  // Community Posts
  app.get("/api/community/posts", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, groupId, limit, offset } = req.query;
      const posts = await storage.getCommunityPosts(
        userId as string | undefined,
        groupId as string | undefined,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/community/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getCommunityPost(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ post });
    } catch (error) {
      console.error("Error fetching community post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/community/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { content, mediaUrls, postType, groupId, forumId, isPublic, tags } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const post = await storage.createCommunityPost({
        authorId: userId,
        content,
        mediaUrls: mediaUrls || [],
        postType: postType || "post",
        groupId: groupId || null,
        forumId: forumId || null,
        isPublic: isPublic !== false,
        tags: tags || [],
      });

      res.status(201).json({ post });
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/community/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.authorId !== userId) {
        return res.status(403).json({ error: "You can only edit your own posts" });
      }

      const { content, mediaUrls, tags } = req.body;
      const updated = await storage.updateCommunityPost(id, {
        content,
        mediaUrls,
        tags,
      });

      res.json({ post: updated });
    } catch (error) {
      console.error("Error updating community post:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/community/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.authorId !== userId) {
        return res.status(403).json({ error: "You can only delete your own posts" });
      }

      await storage.deleteCommunityPost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting community post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Post Comments
  app.get("/api/community/posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json({ comments });
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { postId } = req.params;
      const { content, parentCommentId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const comment = await storage.createPostComment({
        postId,
        authorId: userId,
        content,
        parentCommentId: parentCommentId || null,
      });

      res.status(201).json({ comment });
    } catch (error) {
      console.error("Error creating post comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/community/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const [comment] = await db.select().from(postComments).where(eq(postComments.id, id));
      
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      if (comment.authorId !== userId) {
        return res.status(403).json({ error: "You can only delete your own comments" });
      }

      await storage.deletePostComment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Post Reactions
  app.post("/api/community/posts/:postId/reactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { postId } = req.params;
      const { reactionType } = req.body;

      const reaction = await storage.togglePostReaction(postId, userId, reactionType || "like");
      res.json({ reaction });
    } catch (error) {
      console.error("Error toggling post reaction:", error);
      res.status(500).json({ error: "Failed to toggle reaction" });
    }
  });

  // Community Groups
  app.get("/api/community/groups", isAuthenticated, async (req: any, res) => {
    try {
      const { category, limit } = req.query;
      const groups = await storage.getCommunityGroups(
        category as string | undefined,
        limit ? parseInt(limit as string) : 50
      );
      res.json({ groups });
    } catch (error) {
      console.error("Error fetching community groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.get("/api/community/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const group = await storage.getCommunityGroup(id);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.json({ group });
    } catch (error) {
      console.error("Error fetching community group:", error);
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  app.post("/api/community/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { name, description, slug, category, isPublic, isPrivate, rules, tags } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const group = await storage.createCommunityGroup({
        name,
        description,
        slug,
        ownerId: userId,
        category,
        isPublic: isPublic !== false,
        isPrivate: isPrivate || false,
        rules,
        tags: tags || [],
      });

      res.status(201).json({ group });
    } catch (error) {
      console.error("Error creating community group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.post("/api/community/groups/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const member = await storage.joinGroup(id, userId);
      res.json({ member });
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  app.post("/api/community/groups/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      await storage.leaveGroup(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ error: "Failed to leave group" });
    }
  });

  // Forums
  app.get("/api/community/forums", isAuthenticated, async (req: any, res) => {
    try {
      const forums = await storage.getForums();
      res.json({ forums });
    } catch (error) {
      console.error("Error fetching forums:", error);
      res.status(500).json({ error: "Failed to fetch forums" });
    }
  });

  app.get("/api/community/forums/:id/topics", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { limit, offset } = req.query;
      const topics = await storage.getForumTopics(
        id,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );
      res.json({ topics });
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  app.get("/api/community/topics/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      
      // Increment views
      await storage.incrementTopicViews(id);
      
      res.json({ topic });
    } catch (error) {
      console.error("Error fetching forum topic:", error);
      res.status(500).json({ error: "Failed to fetch topic" });
    }
  });

  app.post("/api/community/forums/:forumId/topics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { forumId } = req.params;
      const { title, content, slug, tags } = req.body;

      if (!title || !content || !slug) {
        return res.status(400).json({ error: "Title, content, and slug are required" });
      }

      const topic = await storage.createForumTopic({
        forumId,
        authorId: userId,
        title,
        content,
        slug,
        tags: tags || [],
      });

      res.status(201).json({ topic });
    } catch (error) {
      console.error("Error creating forum topic:", error);
      res.status(500).json({ error: "Failed to create topic" });
    }
  });

  app.get("/api/community/topics/:topicId/replies", isAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      const replies = await storage.getForumReplies(topicId);
      res.json({ replies });
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  app.post("/api/community/topics/:topicId/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { topicId } = req.params;
      const { content, parentReplyId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const reply = await storage.createForumReply({
        topicId,
        authorId: userId,
        content,
        parentReplyId: parentReplyId || null,
      });

      res.status(201).json({ reply });
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  // Community Events
  app.get("/api/community/events", isAuthenticated, async (req: any, res) => {
    try {
      const { limit, upcoming } = req.query;
      const events = await storage.getCommunityEvents(
        limit ? parseInt(limit as string) : 20,
        upcoming !== "false"
      );
      res.json({ events });
    } catch (error) {
      console.error("Error fetching community events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/community/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getCommunityEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ event });
    } catch (error) {
      console.error("Error fetching community event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/community/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { title, description, slug, eventType, startDate, endDate, location, locationUrl, isOnline, isPublic, maxAttendees, registrationRequired, registrationUrl, tags } = req.body;

      if (!title || !slug || !startDate) {
        return res.status(400).json({ error: "Title, slug, and start date are required" });
      }

      const event = await storage.createCommunityEvent({
        organizerId: userId,
        title,
        description,
        slug,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        locationUrl,
        isOnline: isOnline || false,
        isPublic: isPublic !== false,
        maxAttendees,
        registrationRequired: registrationRequired || false,
        registrationUrl,
        tags: tags || [],
      });

      res.status(201).json({ event });
    } catch (error) {
      console.error("Error creating community event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.post("/api/community/events/:id/register", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const attendee = await storage.registerForEvent(id, userId);
      res.json({ attendee });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ error: "Failed to register for event" });
    }
  });

  app.post("/api/community/events/:id/unregister", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      await storage.unregisterFromEvent(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unregistering from event:", error);
      res.status(500).json({ error: "Failed to unregister from event" });
    }
  });

  // Activity Feed
  app.get("/api/community/activity", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, limit } = req.query;
      const activities = await storage.getActivityFeed(
        userId as string | undefined,
        limit ? parseInt(limit as string) : 50
      );
      res.json({ activities });
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ error: "Failed to fetch activity feed" });
    }
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { unreadOnly } = req.query;
      const notifications = await storage.getNotifications(userId, unreadOnly === "true");
      res.json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
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

function getMockParsedResume(resumeText: string): {
  contactInfo: { name: string; email?: string; phone?: string; linkedin?: string; portfolio?: string };
  skills: string[];
  education: { school: string; degree?: string; major?: string; gradYear?: string }[];
  experience: { company: string; title: string; dates?: string; description?: string }[];
} {
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = resumeText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const lines = resumeText.split('\n').filter(l => l.trim());
  const name = lines[0]?.trim() || "Unknown";

  return {
    contactInfo: {
      name,
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
    },
    skills: ["Communication", "Problem Solving", "Team Collaboration", "Adaptability"],
    education: [
      { school: "University", degree: "Bachelor's Degree", gradYear: "2020" }
    ],
    experience: [
      { company: "Previous Company", title: "Professional Role", dates: "2020-Present", description: "Contributed to team projects and initiatives." }
    ]
  };
}

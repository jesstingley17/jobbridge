// Vercel serverless function wrapper for Express app
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import compression from 'compression';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/static.js';
import { setupAuth } from '../server/replitAuth.js';
import { ensureEnvWarn, ensureEnvOrThrow } from '../server/env.js';

// Create Express app instance
const app = express();

// Apply middleware (same as server/index.ts)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
}));

// Canonical domain redirects (simplified for Vercel)
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  const hasWww = host.startsWith('www.');
  const canonicalDomain = 'thejobbridge-inc.com';
  
  if (!isHttps || hasWww || (host !== canonicalDomain && host.includes('vercel.app'))) {
    // Skip redirects on Vercel preview deployments
    if (host.includes('vercel.app')) {
      return next();
    }
    const canonicalUrl = `https://${canonicalDomain}${req.originalUrl || req.url}`;
    return res.redirect(301, canonicalUrl);
  }
  
  next();
});

// Security headers (manual CSP - same as server/index.ts)
app.use((req, res, next) => {
  const baseUrl = process.env.CLIENT_URL || `https://thejobbridge-inc.com`;
  
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dashboard.searchatlas.com https://fonts.googleapis.com https://js.stripe.com https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://ai-gateway.vercel.sh https://*.supabase.co https://api.stripe.com https://api.mixedbread.ai https://dashboard.searchatlas.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// JSON middleware
app.use(express.json({
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf;
  },
}));

app.use(express.urlencoded({ extended: false }));

// Initialize app (lazy initialization)
let appInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Warn/validate environment variables early to provide clearer errors
      try {
        // Required: Supabase URL and Service Role Key for auth
        // DATABASE_URL defaults to Supabase pooler connection if not set
        // SESSION_SECRET required for session store
        const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SESSION_SECRET'];
        
        if (process.env.NODE_ENV === 'production') {
          ensureEnvOrThrow(requiredEnvs);
        } else {
          ensureEnvWarn(requiredEnvs);
        }
        
        // Warn if DATABASE_URL is missing (but don't fail - it can use Supabase pooler)
        if (!process.env.DATABASE_URL) {
          console.warn('DATABASE_URL not set; ensure your db.ts uses a Supabase pooler connection or set DATABASE_URL explicitly.');
        }
      } catch (envErr: any) {
        console.error('Env validation error:', envErr.message);
        throw envErr;
      }
      // Setup authentication (includes session middleware)
      await setupAuth(app);

      // Register all routes
      await registerRoutes(app);

      // Serve static files in production
      if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
      }

      appInitialized = true;
      console.log('Express app initialized for Vercel');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  })();

  return initPromise;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize app on first request
  try {
    await initializeApp();
  } catch (initError: any) {
    // Log and return a clearer 500 error so Vercel doesn't surface a vague FUNCTION_INVOCATION_FAILED
    console.error('Failed to initialize Express app in Vercel handler:', initError);
    const message = initError?.message || 'Failed to initialize application';
    // Include stack/message in development for easier debugging
    if (!res.headersSent) {
      return res.status(500).json({ error: 'App initialization failed', message: process.env.NODE_ENV === 'development' ? message : undefined });
    }
    return;
  }

  // Convert Vercel request/response to Express-compatible format
  // Vercel's req/res are already compatible with Express, but we need to ensure proper handling
  return new Promise<void>((resolve, reject) => {
    // Handle the request through Express
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error('Express error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
        reject(err);
      } else {
        if (!res.headersSent) {
          res.status(404).json({ error: 'Not found' });
        }
        resolve();
      }
    });
  });
}

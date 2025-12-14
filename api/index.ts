// Vercel serverless function wrapper for Express app
// IMPORTANT: This file must be able to resolve @shared/schema
// The shared directory is copied to api/shared during build
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import compression from 'compression';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/static.js';
// Don't import setupAuth - we handle auth differently on Vercel

// Ensure shared schema is accessible - Vercel needs this at runtime
// The build script copies shared/ to api/shared/, but we need to ensure
// the module resolution works. The package.json imports should handle this.

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
      // Warn about missing environment variables (but don't fail deployment)
      // Routes will handle missing env vars gracefully
      const importantEnvs = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SESSION_SECRET'];
      const missing = importantEnvs.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
        console.warn('⚠️  Some features may not work correctly. Please set these in Vercel dashboard.');
      }
      
      // Warn if DATABASE_URL is missing (but don't fail - it can use Supabase pooler)
      if (!process.env.DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL not set; ensure your db.ts uses a Supabase pooler connection or set DATABASE_URL explicitly.');
      }
      // Setup session middleware (Supabase handles authentication)
      // This must be done BEFORE registerRoutes, which also tries to set it up
      try {
        const { getSession } = await import('../server/auth.js');
        app.set("trust proxy", 1);
        app.use(getSession());
        console.log('✅ Session middleware configured');
      } catch (sessionError: any) {
        console.error('⚠️  Failed to setup session middleware:', sessionError.message);
        console.error('⚠️  Session error stack:', sessionError.stack);
        // Continue without session middleware - some features won't work but app won't crash
      }

      // Register all routes (this may fail if critical imports are missing)
      try {
        await registerRoutes(app);
        console.log('✅ Routes registered successfully');
      } catch (routesError: any) {
        console.error('❌ Error registering routes:', routesError.message);
        console.error('❌ Error name:', routesError.name);
        console.error('❌ Error stack:', routesError.stack);
        // Log the full error details for debugging
        if (routesError.cause) {
          console.error('❌ Error cause:', routesError.cause);
        }
        // Re-throw to see the actual error in Vercel logs
        throw routesError;
      }

      // Note: In Vercel, static files are served automatically by the platform
      // We don't need to call serveStatic() here - Vercel handles static assets
      // via the public directory or build output
      // serveStatic() is only used for self-hosted Express servers

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
    // Log full error details for debugging
    console.error('❌ Failed to initialize Express app in Vercel handler');
    console.error('❌ Error message:', initError?.message);
    console.error('❌ Error name:', initError?.name);
    console.error('❌ Error stack:', initError?.stack);
    if (initError?.cause) {
      console.error('❌ Error cause:', initError.cause);
    }
    
    // Return a clearer 500 error with details
    const message = initError?.message || 'Failed to initialize application';
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'App initialization failed', 
        message: message,
        // Include more details in response for debugging (Vercel logs will have full stack)
        details: process.env.NODE_ENV === 'development' ? {
          name: initError?.name,
          stack: initError?.stack?.split('\n').slice(0, 10).join('\n')
        } : undefined
      });
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

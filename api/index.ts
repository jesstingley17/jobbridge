// Vercel serverless function wrapper for Express app
// Note: This is a placeholder. Full Express apps work better on Railway, Render, or Fly.io
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This Express app needs to be converted to serverless functions for Vercel
  // For now, return a helpful error message
  res.status(503).json({ 
    error: 'Serverless conversion required',
    message: 'This Express app needs to be converted to serverless functions for Vercel.',
    recommendation: 'Deploy to Railway, Render, or Fly.io for full Express app support.',
    docs: 'See VERCEL_DEPLOYMENT.md for details'
  });
}


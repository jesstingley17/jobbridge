import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Try multiple possible paths for the build directory
  // This handles both development and production environments
  let distPath: string;
  
  // First, try to get the path relative to the current file
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    distPath = path.resolve(__dirname, "public");
  } catch {
    // Fallback: try process.cwd() if import.meta.url doesn't work
    distPath = path.resolve(process.cwd(), "dist", "public");
  }
  
  // Also try common Vercel/build paths
  const possiblePaths = [
    distPath,
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "client", "dist"),
  ];
  
  // Find the first path that exists
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }
  
  // Only throw error if we're in a context where static files are expected
  // (e.g., self-hosted server, not Vercel serverless)
  if (!fs.existsSync(distPath)) {
    // In Vercel, static files are handled by the platform, so this is OK
    if (process.env.VERCEL) {
      console.log('⚠️  Static files directory not found, but this is OK in Vercel (static files are served by platform)');
      return; // Don't throw, just return - Vercel handles static files
    }
    
    // For self-hosted servers, throw error
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(', ')}. Make sure to build the client first.`,
    );
  }

  // Serve static files with caching headers for better performance
  app.use(express.static(distPath, {
    maxAge: '1y', // Cache static assets for 1 year
    immutable: true, // Files with hashes in names are immutable
    etag: true, // Enable ETag for cache validation
    lastModified: true, // Enable Last-Modified headers
  }));

  // fall through to index.html if the file doesn't exist
  // Don't cache index.html (it changes with deployments)
  app.use("*", (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

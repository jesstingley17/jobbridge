import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
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

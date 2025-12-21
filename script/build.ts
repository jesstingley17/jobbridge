import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "resend",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
  "@shared",  // Include shared schema in bundle
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
    alias: {
      "@shared": "./shared",
    },
    plugins: [
      {
        name: "resolve-shared",
        setup(build) {
          // Resolve @shared/schema imports
          build.onResolve({ filter: /^@shared\/schema$/ }, (args) => {
            return { path: join(process.cwd(), "shared/schema.ts") };
          });
          // Resolve ../shared/schema imports
          build.onResolve({ filter: /^\.\.\/shared\/schema$/ }, (args) => {
            return { path: join(process.cwd(), "shared/schema.ts") };
          });
          // Resolve @shared/* imports
          build.onResolve({ filter: /^@shared\// }, (args) => {
            const path = args.path.replace("@shared/", "");
            return { path: join(process.cwd(), "shared", path) };
          });
        },
      },
    ],
  });

  // Copy shared directory to dist and api for Vercel serverless functions
  if (existsSync("shared")) {
    console.log("copying shared directory...");
    await cp("shared", "dist/shared", { recursive: true });
    // Also copy to api directory for Vercel serverless functions
    // Vercel runs api/index.ts directly, so it needs shared/ accessible
    await cp("shared", "api/shared", { recursive: true });
  }

  // Copy all server files to api/server for Vercel
  // Vercel runs api/index.ts which imports from ../server/*
  if (existsSync("server")) {
    console.log("copying server files to api/server...");
    // Ensure api/server directory exists
    const apiServerPath = "api/server";
    if (!existsSync(apiServerPath)) {
      await mkdir(apiServerPath, { recursive: true });
    }
    
    // Copy all server files (but exclude node_modules if any)
    const serverFiles = await readdir("server", { withFileTypes: true });
    for (const file of serverFiles) {
      // Skip node_modules and other non-essential directories
      if (file.name === "node_modules" || file.name.startsWith(".")) {
        continue;
      }
      
      const sourcePath = join("server", file.name);
      const destPath = join(apiServerPath, file.name);
      
      if (file.isDirectory()) {
        // For directories, copy recursively
        if (existsSync(destPath)) {
          await rm(destPath, { recursive: true, force: true });
        }
        await cp(sourcePath, destPath, { recursive: true });
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        // Copy TypeScript and JavaScript files
        await cp(sourcePath, destPath);
      }
    }
    console.log("✓ Server files copied successfully");
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

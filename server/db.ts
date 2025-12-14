import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
// Use relative import for Vercel compatibility
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Use DATABASE_URL, or fall back to POSTGRES_PRISMA_URL for Vercel environments
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  const errorMsg = "DATABASE_URL or POSTGRES_PRISMA_URL must be set. Did you forget to provision a database?";
  console.error(`[DB Init Error] ${errorMsg}`);
  console.error(`[DB Init] DATABASE_URL: ${process.env.DATABASE_URL || 'NOT SET'}`);
  console.error(`[DB Init] POSTGRES_PRISMA_URL: ${process.env.POSTGRES_PRISMA_URL || 'NOT SET'}`);
  throw new Error(errorMsg);
}

console.log(`[DB Init] Using database URL: ${databaseUrl.substring(0, 50)}...`);

// Parse connection string and add SSL config if needed
// Supabase pooler connections use self-signed certificates, so we must allow them
const isSupabase = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('supabase.co');

// Base connection config
const connectionConfig: any = { 
  connectionString: databaseUrl,
  // Optimize for serverless: keep connections alive but don't keep too many
  max: 2,  // Reduced from default 10 for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000, // Reduced from 5000ms for faster failures
  // Enable statement timeout to prevent long-running queries
  statement_timeout: 10000, // 10 seconds max per query
};

// CRITICAL: Always allow self-signed certs for Supabase pooler connections
// This is required for Supabase's connection pooler to work
// node-postgres requires explicit SSL config even if connection string has sslmode
// Set SSL config unconditionally to ensure it's always applied
connectionConfig.ssl = {
  rejectUnauthorized: false, // Allow self-signed certificates (required for Supabase pooler)
};

if (isSupabase) {
  console.log('[DB Init] SSL configured for Supabase pooler connection (rejectUnauthorized: false)');
} else {
  console.log('[DB Init] SSL configured for database connection (rejectUnauthorized: false)');
}

// Handle SSL for databases that require it (keep ssl: false from above since we set it directly)
// Additional configuration can be added here if needed

console.log(`[DB Init] Connection config: ${JSON.stringify({ ...connectionConfig, connectionString: connectionConfig.connectionString?.substring(0, 50) })}`);

let pool: pg.Pool;
let db: any;

try {
  pool = new Pool(connectionConfig);
  db = drizzle(pool, { schema });
  console.log('[DB Init] Pool and Drizzle initialized successfully');
} catch (poolErr: any) {
  console.error('[DB Init] Failed to initialize pool:', poolErr.message);
  throw poolErr;
}

export { pool, db };

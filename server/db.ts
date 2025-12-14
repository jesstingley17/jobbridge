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
// Optimized for Vercel serverless: smaller pool, faster timeouts, but longer connection timeout
const connectionConfig: any = { 
  connectionString: databaseUrl,
  max: 1,  // Single connection for serverless (functions are stateless)
  idleTimeoutMillis: 10000, // Shorter idle timeout (10s instead of 30s)
  connectionTimeoutMillis: 8000, // Longer connection timeout (8s) for Supabase pooler
  statement_timeout: 8000, // 8 seconds max per query
  // Prevent connection leaks in serverless
  allowExitOnIdle: true,
};

      // CRITICAL: Always allow self-signed certs for Supabase pooler connections
      // This is required for Supabase's connection pooler to work
      // node-postgres requires explicit SSL config even if connection string has sslmode
      // Set SSL config unconditionally to ensure it's always applied
      connectionConfig.ssl = {
        rejectUnauthorized: false, // Allow self-signed certificates (required for Supabase pooler)
      };

      // Additional optimizations for serverless environments
      // Prevent connection leaks and improve reliability
      connectionConfig.allowExitOnIdle = true; // Allow pool to close when idle

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
  
  // Add error handlers to prevent unhandled rejections
  pool.on('error', (err: Error) => {
    console.error('[DB Pool] Unexpected error on idle client:', err);
  });
  
  pool.on('connect', (client) => {
    console.log('[DB Pool] Client connected');
  });
  
  db = drizzle(pool, { schema });
  console.log('[DB Init] Pool and Drizzle initialized successfully');
} catch (poolErr: any) {
  console.error('[DB Init] Failed to initialize pool:', poolErr.message);
  throw poolErr;
}

export { pool, db };

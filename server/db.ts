import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

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
const connectionConfig: any = { 
  connectionString: databaseUrl,
  // Optimize for serverless: keep connections alive but don't keep too many
  max: 2,  // Reduced from default 10 for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Handle SSL for databases that require it
// If DATABASE_SSL_REJECT_UNAUTHORIZED is set to 'false', allow self-signed certs
if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false') {
  connectionConfig.ssl = { rejectUnauthorized: false };
} else if (databaseUrl?.includes('sslmode=require') || 
           databaseUrl?.includes('sslmode=prefer')) {
  connectionConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production' && 
           (databaseUrl?.includes('supabase') || 
            databaseUrl?.includes('railway') ||
            databaseUrl?.includes('vercel'))) {
  // For production databases, use SSL
  connectionConfig.ssl = true;
}

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

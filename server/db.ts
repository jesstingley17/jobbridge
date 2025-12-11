import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use DATABASE_URL, or fall back to POSTGRES_PRISMA_URL for Vercel environments
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or POSTGRES_PRISMA_URL must be set. Did you forget to provision a database?",
  );
}

// Parse connection string and add SSL config if needed
const connectionConfig: any = { connectionString: databaseUrl };

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

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema });

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse connection string and add SSL config if needed
const connectionConfig: any = { connectionString: process.env.DATABASE_URL };

// Handle SSL for databases that require it
// If DATABASE_SSL_REJECT_UNAUTHORIZED is set to 'false', allow self-signed certs
if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false') {
  connectionConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.DATABASE_URL?.includes('sslmode=require') || 
           process.env.DATABASE_URL?.includes('sslmode=prefer')) {
  connectionConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production' && 
           (process.env.DATABASE_URL?.includes('supabase') || 
            process.env.DATABASE_URL?.includes('railway') ||
            process.env.DATABASE_URL?.includes('vercel'))) {
  // For production databases, use SSL
  connectionConfig.ssl = true;
}

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema });

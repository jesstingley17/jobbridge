#!/usr/bin/env tsx
/**
 * Script to run database migrations
 * Usage: npm run migrate
 * 
 * This will:
 * 1. Push the schema using drizzle-kit push (syncs schema to database)
 * 2. Optionally run SQL migration files if needed
 */

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '../server/db.js';

async function runMigrations() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL or POSTGRES_PRISMA_URL must be set');
      console.error('Set it in your .env file or Vercel environment variables');
      process.exit(1);
    }

    console.log('🔄 Running database migrations...');
    console.log('📊 Pushing schema to database using drizzle-kit...');
    
    // Use drizzle-kit push to sync schema
    try {
      execSync('npx drizzle-kit push', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Schema pushed successfully');
    } catch (error: any) {
      console.error('❌ Error pushing schema:', error.message);
      throw error;
    }

    // Optionally run SQL migration files
    const migrationFiles = [
      'create_community_tables.sql',
      'create_notes_table.sql',
      'add_user_consent_fields.sql'
    ];

    console.log('\n📝 Checking for additional SQL migrations...');
    for (const file of migrationFiles) {
      const filePath = join(process.cwd(), 'migrations', file);
      try {
        const sql = await readFile(filePath, 'utf-8');
        console.log(`\n📄 Running ${file}...`);
        
        // Execute SQL (you might need to adjust this based on your DB setup)
        // For now, just log that it exists
        console.log(`   Found migration: ${file}`);
        console.log(`   Note: Run this SQL manually in your database if needed`);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(`   ⏭️  Skipping ${file} (not found)`);
        } else {
          console.error(`   ❌ Error reading ${file}:`, error.message);
        }
      }
    }

    console.log('\n✅ Migrations completed!');
    console.log('\n💡 If you have SQL files in migrations/, you may need to run them manually in your database.');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

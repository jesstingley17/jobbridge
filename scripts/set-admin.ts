#!/usr/bin/env tsx
/**
 * Script to set a user as admin
 * Usage: npm run set-admin <user-email-or-id>
 * 
 * This updates the user's role to "admin" in the users table
 */

import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { eq, or } from "drizzle-orm";

async function setAdmin(emailOrId: string) {
  try {
    // Find user by email or ID
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, emailOrId),
          eq(users.id, emailOrId)
        )
      )
      .limit(1);

    if (!user) {
      console.error(`❌ User not found: ${emailOrId}`);
      process.exit(1);
    }

    // Update role to admin
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));

    console.log(`✅ User set as admin:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName || ""}`);
    console.log(`   Role: admin`);
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error setting admin:", error);
    process.exit(1);
  }
}

const emailOrId = process.argv[2];
if (!emailOrId) {
  console.error("Usage: npm run set-admin <user-email-or-id>");
  process.exit(1);
}

setAdmin(emailOrId);

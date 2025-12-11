// Script to create a regular user account
// Run with: DATABASE_URL=your_db_url npx tsx scripts/create-user.ts
// Make sure DATABASE_URL environment variable is set

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL must be set.");
  console.error("Set it as an environment variable:");
  console.error("  DATABASE_URL=postgresql://... npx tsx scripts/create-user.ts");
  console.error("\nOr create a .env file with DATABASE_URL=...");
  process.exit(1);
}

import { storage, hashPassword } from "../server/storage.js";
import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function createUser() {
  const email = "jessicaleetingley@outlook.com";
  const password = "Ada@1417!";
  const firstName = "Jessica";
  const lastName = "Lee Tingley";

  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      // Update existing user password
      const hashedPassword = await hashPassword(password);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          firstName,
          lastName,
          termsAccepted: true,
          marketingConsent: true,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));
      
      console.log(`✅ Updated existing user ${email} with new password`);
    } else {
      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUserWithPassword({
        email,
        firstName,
        lastName,
        hashedPassword,
        termsAccepted: true,
        marketingConsent: true,
      });
      
      console.log(`✅ Created user ${email}`);
      console.log("User ID:", user.id);
    }
    
    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👤 Name:", firstName, lastName);
    console.log("✅ Terms Accepted: true");
    console.log("📧 Marketing Consent: true");
    console.log("\n✨ User account ready!");
  } catch (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

createUser().then(() => process.exit(0));

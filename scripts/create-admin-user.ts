// Script to create admin user
// Run with: tsx scripts/create-admin-user.ts

import { storage, hashPassword } from "../server/storage";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  const email = "jessicaleetingley@outlook.com";
  const password = "Axel@1417!";
  const firstName = "Jessica-Lee";
  const lastName = "Tingley";

  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      // Update existing user to be admin
      const hashedPassword = await hashPassword(password);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          role: "admin",
          firstName,
          lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));
      
      console.log(`✅ Updated existing user ${email} to admin with new password`);
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUserWithPassword({
        email,
        firstName,
        lastName,
        hashedPassword,
      });
      
      // Set role to admin
      await storage.updateUserRole(user.id, "admin");
      
      console.log(`✅ Created admin user ${email}`);
    }
    
    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👤 Role: admin");
    console.log("\n✨ Admin user ready!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser().then(() => process.exit(0));


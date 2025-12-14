// Add this endpoint after the sync-supabase-user endpoint, around line 270

  // Admin user sync endpoint - ensures admin users are synced with Supabase
  app.post('/api/admin/sync-user', async (req, res) => {
    try {
      // Require admin token for security
      const adminToken = req.headers['x-admin-token'];
      const expectedToken = process.env.ADMIN_RESET_TOKEN;
      
      if (!expectedToken || adminToken !== expectedToken) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Admin token required. Set ADMIN_RESET_TOKEN environment variable.'
        });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      // Check if user exists in database
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }

      // Get Supabase admin client
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabaseAdmin = getSupabaseAdmin();
      
      // Find user in Supabase Auth by email
      const { data: { users: supabaseUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing Supabase users:", listError);
        return res.status(500).json({ error: "Failed to find user in Supabase Auth" });
      }

      const supabaseUser = supabaseUsers.find(u => u.email === email);
      
      let syncResult = {
        email,
        databaseUser: user,
        supabaseUser: null as any,
        adminRoleAssigned: false,
        actions: [] as string[],
      };

      // If user doesn't exist in Supabase Auth, we can't create them via API
      // They need to sign up first via Supabase Auth
      if (!supabaseUser) {
        return res.status(404).json({ 
          error: "User not found in Supabase Auth",
          message: "User exists in database but not in Supabase Auth. They need to sign up via Supabase Auth first (email/password or magic link).",
          databaseUser: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          nextSteps: [
            "Have the user sign up via Supabase Auth at /auth",
            "Then run this sync again to assign admin role",
            "Or use the sync-supabase-user endpoint after they sign up"
          ]
        });
      }

      syncResult.supabaseUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        email_confirmed_at: supabaseUser.email_confirmed_at,
      };
      syncResult.actions.push("Found user in Supabase Auth");

      // Ensure user ID matches between database and Supabase
      if (user.id !== supabaseUser.id) {
        // Merge: Update database user ID to Supabase ID
        console.log(`Merging user: Database ID ${user.id} -> Supabase ID ${supabaseUser.id}`);
        const mergedUser = await storage.upsertUser({
          id: supabaseUser.id,
          email: user.email || supabaseUser.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          emailVerified: supabaseUser.email_confirmed_at ? true : false,
          termsAccepted: user.termsAccepted || false,
          marketingConsent: user.marketingConsent || false,
          role: user.role || null,
          stripeCustomerId: user.stripeCustomerId || null,
          stripeSubscriptionId: user.stripeSubscriptionId || null,
          subscriptionTier: user.subscriptionTier || null,
        });
        syncResult.databaseUser = mergedUser;
        syncResult.actions.push(`Merged user IDs: ${user.id} -> ${supabaseUser.id}`);
      } else {
        syncResult.actions.push("User IDs already match");
      }

      // Assign admin role in database
      const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
      const adminPattern = process.env.ADMIN_EMAIL_PATTERN;
      let shouldBeAdmin = false;

      if (user.role === "admin") {
        shouldBeAdmin = true;
      } else if (user.email && adminEmails.includes(user.email)) {
        shouldBeAdmin = true;
      } else if (adminPattern && user.email) {
        try {
          const regex = new RegExp(adminPattern);
          if (regex.test(user.email)) {
            shouldBeAdmin = true;
          }
        } catch (regexError) {
          console.error("Invalid ADMIN_EMAIL_PATTERN regex:", regexError);
        }
      }

      if (shouldBeAdmin && user.role !== "admin") {
        // Update role in database
        const updatedUser = await storage.updateUserRole(user.id, "admin");
        if (updatedUser) {
          syncResult.databaseUser = updatedUser;
          syncResult.adminRoleAssigned = true;
          syncResult.actions.push("Assigned admin role in database");
        }
      } else if (user.role === "admin") {
        syncResult.adminRoleAssigned = true;
        syncResult.actions.push("User already has admin role in database");
      }

      // Also assign admin role in user_roles table (if it exists)
      try {
        const { db } = await import('./db.js');
        const { sql } = await import('drizzle-orm');
        
        // Check if roles table exists and assign admin role
        const roleCheck = await db.execute(sql`
          SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1
        `);
        
        if (roleCheck.rows.length > 0) {
          const adminRoleId = roleCheck.rows[0].id;
          
          // Insert into user_roles if not exists
          await db.execute(sql`
            INSERT INTO public.user_roles (user_id, role_id)
            SELECT ${user.id}, ${adminRoleId}
            WHERE NOT EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = ${user.id} AND role_id = ${adminRoleId}
            )
          `);
          
          syncResult.actions.push("Assigned admin role in user_roles table");
        }
      } catch (roleError: any) {
        // user_roles table might not exist, that's okay
        if (!roleError.message?.includes('does not exist')) {
          console.warn("Could not assign role in user_roles table:", roleError.message);
        }
      }

      res.json({
        success: true,
        ...syncResult,
        message: "Admin user synced successfully",
      });
    } catch (error) {
      console.error("Error syncing admin user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address", details: error.errors });
      }
      res.status(500).json({ 
        error: "Failed to sync admin user", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

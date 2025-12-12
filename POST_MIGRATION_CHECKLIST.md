# ✅ Post-Migration Checklist

You've run the migrations! Here's what to do next:

## 1. Verify Tables Were Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. Check that these tables exist:
   - ✅ `users` (should already exist)
   - ✅ `community_posts`
   - ✅ `post_comments`
   - ✅ `post_reactions`
   - ✅ `community_groups`
   - ✅ `forums`
   - ✅ `forum_topics`
   - ✅ `notes`
   - ✅ And other tables from the migration

## 2. Verify User Consent Fields

Check the `users` table structure:
1. Go to **Table Editor** → `users` table
2. Click on the table to view columns
3. Verify these columns exist:
   - ✅ `terms_accepted` (BOOLEAN)
   - ✅ `terms_accepted_at` (TIMESTAMPTZ)
   - ✅ `marketing_consent` (BOOLEAN)
   - ✅ `marketing_consent_at` (TIMESTAMPTZ)

## 3. Test Authentication

Now that tables exist, test the authentication flow:

### A. Test Sign Up
1. Go to your app's sign up page
2. Try creating a new account
3. Check that it succeeds (no more 500 errors!)

### B. Test Sign In
1. Try signing in with an existing account
2. Verify you stay logged in
3. Check that you can access protected routes like `/community`

### C. Check API Endpoints
Open browser console and check:
- `/api/auth/user` should return 200 (not 500)
- `/api/subscription/status` should work
- `/api/mentors` should work

## 4. Deploy to Vercel (if needed)

If you made changes locally:
```bash
git add -A
git commit -m "Run database migrations"
git push origin main
```

Vercel will automatically redeploy.

## 5. Monitor for Errors

After deployment:
1. Check Vercel function logs for any remaining errors
2. Test the app in production
3. Verify users can sign up and stay logged in

## 🎯 Expected Results

After migrations:
- ✅ No more "relation does not exist" errors
- ✅ `/api/auth/user` returns 200 (not 500)
- ✅ Users can sign up successfully
- ✅ Users stay logged in after authentication
- ✅ Community page loads without errors
- ✅ All API endpoints work correctly

## 🐛 If You Still See Errors

If you still get 500 errors:
1. Check Vercel function logs for specific error messages
2. Verify `DATABASE_URL` is set in Vercel environment variables
3. Make sure the Supabase database connection is working
4. Check that all tables were created (see step 1)

## 📝 Next Steps

Once everything works:
- Users can now sign up and sign in
- Community features should be functional
- All database operations should work smoothly

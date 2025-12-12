# ✅ Post-Migration Checklist

After running migrations, verify everything is set up correctly:

## 1. Verify Tables Exist in Supabase

Go to **Supabase Dashboard → Table Editor** and confirm these tables exist:

### Core Tables (Required)
- ✅ `users` - User accounts
- ✅ `sessions` - Session storage
- ✅ `user_profiles` - User profile information

### Community Tables (If using community features)
- ✅ `community_posts`
- ✅ `post_comments`
- ✅ `post_reactions`
- ✅ `community_groups`
- ✅ `group_members`
- ✅ `forums`
- ✅ `forum_topics`
- ✅ `forum_replies`
- ✅ `community_events`
- ✅ `event_attendees`
- ✅ `activity_feed`
- ✅ `notifications`

### Other Tables
- ✅ `notes` - Notes table
- ✅ `jobs` - Job listings (if exists)
- ✅ `applications` - Job applications (if exists)

## 2. Verify User Consent Fields

Check that the `users` table has these columns:
- ✅ `terms_accepted` (BOOLEAN)
- ✅ `terms_accepted_at` (TIMESTAMPTZ)
- ✅ `marketing_consent` (BOOLEAN)
- ✅ `marketing_consent_at` (TIMESTAMPTZ)

**How to check:**
1. Go to Supabase → Table Editor → `users` table
2. Click on the table to view columns
3. Verify all columns are present

## 3. Test Your App

### Test Authentication
1. **Try signing up** a new user
2. **Try logging in** with an existing user
3. **Check if user stays logged in** after page refresh
4. **Try accessing protected routes** like `/community`

### Test API Endpoints

Check these endpoints in your browser console or via API testing:

```bash
# Check if user endpoint works
GET /api/auth/user

# Should return user object or null (not 500 error)
```

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for any database errors
3. Common errors to watch for:
   - `relation "users" does not exist` - Tables not created
   - `column "terms_accepted" does not exist` - Migration not run
   - `permission denied` - Database permissions issue

## 4. Common Issues & Fixes

### Issue: "relation does not exist" errors
**Fix:** Make sure you ran the complete `run-all-migrations.sql` file

### Issue: User can't sign up/login
**Fix:** 
- Check that `users` table exists
- Verify Supabase environment variables are set in Vercel
- Check Vercel function logs for specific errors

### Issue: 500 errors on `/api/auth/user`
**Fix:**
- Verify `users` table exists and has correct columns
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel
- Review server logs for specific error messages

## 5. Next Steps

Once everything is verified:

1. **Test user registration** - Create a test account
2. **Test user login** - Sign in with the test account
3. **Test protected routes** - Access `/community` or other protected pages
4. **Test admin features** - If you have admin functionality, test it
5. **Monitor logs** - Watch Vercel logs for any errors

## 6. If Something's Not Working

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions → View Logs
   - Look for error messages related to database

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for SQL errors or connection issues

3. **Verify Environment Variables:**
   - `DATABASE_URL` or `POSTGRES_PRISMA_URL` - Database connection
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `VITE_SUPABASE_URL` - Frontend Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Frontend Supabase anon key

## 7. Success Indicators

You'll know everything is working when:
- ✅ Users can sign up successfully
- ✅ Users can log in and stay logged in
- ✅ `/api/auth/user` returns user data (not 500 errors)
- ✅ Protected routes like `/community` are accessible
- ✅ No database errors in Vercel logs

---

**Need Help?** Check the error messages in Vercel logs and Supabase logs for specific issues.

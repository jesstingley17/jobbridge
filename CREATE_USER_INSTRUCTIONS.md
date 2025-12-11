# Creating User Account

## Option 1: Register Through Website (Recommended)

1. Go to: `https://thejobbridge-inc.com/auth`
2. Click on "Join Early Access" tab
3. Fill in the form:
   - **Email**: jessicaleetingley@outlook.com
   - **Password**: Ada@1417!
   - **First Name**: Jessica
   - **Last Name**: Lee Tingley
   - ✅ Check "I agree to the Terms and Conditions and Privacy Policy"
   - ✅ Check "I agree to receive marketing communications..."
4. Click "Join Early Access"

## Option 2: Using Script (Requires Database Migrations)

If you want to use the script, you need to:

1. **First, run database migrations**:
   ```bash
   npm run db:push
   ```
   Or manually run the SQL migrations in the `migrations/` folder.

2. **Then run the script**:
   ```bash
   export $(grep -v '^#' .env.local | xargs)
   NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx scripts/create-user.ts
   ```

## Current Issue

The script shows: `relation "users" does not exist`

This means the database tables haven't been created yet. You need to run migrations first.

## Quick Fix

The easiest way is to just register through the website at:
**https://thejobbridge-inc.com/auth**

The registration form will create the user account with all the required fields.


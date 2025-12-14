-- Migration: Merge duplicate users by email
-- This script helps identify and resolve duplicate user records
-- Run this if you have users with the same email but different IDs

-- Step 1: Identify duplicate users (same email, different IDs)
-- This query shows all duplicate email addresses
SELECT 
  email,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at) as user_ids,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM public.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, email;

-- Step 2: For each duplicate, you need to decide which ID to keep
-- Typically, keep the Supabase Auth ID (if one exists) or the oldest record
-- 
-- Example: If you have users with IDs 'old-uuid' and 'supabase-uuid' for same email
-- You would need to:
-- 1. Update all foreign key references to point to the canonical ID
-- 2. Delete the duplicate user record
--
-- WARNING: This is a destructive operation. Backup your database first!
--
-- Example migration for a specific email:
-- 
-- BEGIN;
-- 
-- -- Update applications table
-- UPDATE public.applications 
-- SET user_id = 'supabase-uuid' 
-- WHERE user_id = 'old-uuid';
-- 
-- -- Update user_profiles table
-- UPDATE public.user_profiles 
-- SET user_id = 'supabase-uuid' 
-- WHERE user_id = 'old-uuid';
-- 
-- -- Update other tables that reference users.id...
-- 
-- -- Finally, delete the duplicate user
-- DELETE FROM public.users WHERE id = 'old-uuid';
-- 
-- COMMIT;

-- Step 3: Add a unique constraint on email to prevent future duplicates
-- (Only run this after merging all duplicates)
-- ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Note: The sync-supabase-user endpoint now handles merging automatically
-- by checking for existing users by email before creating new ones.

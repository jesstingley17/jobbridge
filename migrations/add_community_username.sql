-- Add community_username column to users table
-- Migration: Add communityUsername field for custom community display names

-- Add community_username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'community_username'
  ) THEN
    ALTER TABLE public.users ADD COLUMN community_username VARCHAR;
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_users_community_username ON public.users(community_username);
  END IF;
END $$;

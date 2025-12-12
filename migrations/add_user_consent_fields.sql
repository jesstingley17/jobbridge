-- Add consent fields to public.users table (idempotent)
-- Migration: Add termsAccepted, termsAcceptedAt, marketingConsent, marketingConsentAt columns

-- Add termsAccepted column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'terms_accepted'
  ) THEN
    ALTER TABLE public.users ADD COLUMN terms_accepted BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add termsAcceptedAt column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add marketingConsent column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE public.users ADD COLUMN marketing_consent BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add marketingConsentAt column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'marketing_consent_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN marketing_consent_at TIMESTAMPTZ;
  END IF;
END $$;


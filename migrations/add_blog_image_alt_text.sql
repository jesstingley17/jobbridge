-- Add alt text field for blog post featured images
-- Migration: Add featured_image_alt_text column to blog_posts table

ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS featured_image_alt_text TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.blog_posts.featured_image_alt_text IS 'Alt text for accessibility - describes the featured image for screen readers';

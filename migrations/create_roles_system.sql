-- Role-Based Access Control System
-- Migration: Create roles and user_roles tables for scalable admin control

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id VARCHAR NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Insert default admin role
INSERT INTO public.roles (name, description) 
VALUES ('admin', 'Administrator with full access to manage content and settings')
ON CONFLICT (name) DO NOTHING;

-- Assign admin role to jessicaleetingley@outlook.com
-- Note: This will only work if the user already exists in the users table
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
CROSS JOIN public.roles r
WHERE u.email = 'jessicaleetingley@outlook.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

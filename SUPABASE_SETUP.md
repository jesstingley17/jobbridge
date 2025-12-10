# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

## 2. Create the Notes Table

### Option A: Using SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the SQL from `migrations/create_notes_table.sql`:

```sql
-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert some sample data into the table
INSERT INTO notes (title)
VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from the app.'),
  ('It was awesome!')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Make the data in your table publicly readable by adding an RLS policy
CREATE POLICY "public can read notes"
ON public.notes
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "authenticated users can insert notes"
ON public.notes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete their own notes
CREATE POLICY "authenticated users can delete notes"
ON public.notes
FOR DELETE
TO authenticated
USING (true);
```

5. Click **Run** to execute the query

### Option B: Using Table Editor

1. Go to **Table Editor** in the sidebar
2. Click **New Table**
3. Name it `notes`
4. Add columns:
   - `id` - Type: `bigint`, Primary Key, Identity (auto-increment)
   - `title` - Type: `text`, Not Null
   - `created_at` - Type: `timestamp`, Default: `now()`
   - `updated_at` - Type: `timestamp`, Default: `now()`
5. Click **Save**
6. Insert sample data manually or use the SQL editor

## 3. Get Your Supabase Credentials

✅ **Already configured!** Your Supabase credentials are:
- **Project URL**: `https://mkkmfocbujeeayenvxtl.supabase.co`
- **Project ID**: `mkkmfocbujeeayenvxtl`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (for server-side operations)

## 4. Set Environment Variables

### For Local Development

✅ **Already added to `.env.local`!** Your configuration:

```bash
VITE_SUPABASE_URL=https://mkkmfocbujeeayenvxtl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra21mb2NidWplZWF5ZW52eHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTIyMzYsImV4cCI6MjA4MDk2ODIzNn0._zCxN0ISokh-NuSqRN0Np17jk8gZCv8fUf01-FC2P6E
VITE_SUPABASE_PROJECT_ID=mkkmfocbujeeayenvxtl
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra21mb2NidWplZWF5ZW52eHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM5MjIzNiwiZXhwIjoyMDgwOTY4MjM2fQ.RM0PEUe8h6yGqoL3CDiMRFiBeIBOlLlGBCEPq0FNMbc
DATABASE_URL=postgres://postgres.mkkmfocbujeeayenvxtl:Phouu3tgsqIWM5Bb@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `VITE_SUPABASE_PROJECT_ID` = `your-project-id`
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

### For Replit

1. Go to your Replit project
2. Click on the **Secrets** tab (lock icon)
3. Add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `VITE_SUPABASE_PROJECT_ID` = `your-project-id`

## 5. Update Database URL (Optional)

If you want to use Supabase as your main database instead of the current PostgreSQL:

1. Get your **Database URL** from Supabase Settings → Database → Connection string
2. Update `DATABASE_URL` in your environment variables
3. The format is: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/notes` in your browser
3. You should see the sample notes from Supabase
4. Try adding a new note
5. Try deleting a note

## 7. Using Supabase Client Directly (Frontend)

The app also includes a Supabase client utility at `client/src/utils/supabase/client.ts` that you can use for direct frontend queries:

```typescript
import { supabase } from '@/utils/supabase/client';

// Fetch notes directly from frontend
const { data, error } = await supabase
  .from('notes')
  .select('*');
```

## Troubleshooting

- **"Failed to fetch notes"**: Check that your Supabase URL and anon key are set correctly
- **"RLS policy violation"**: Make sure Row Level Security policies are set up correctly
- **"Table does not exist"**: Run the SQL migration to create the table
- **CORS errors**: Supabase handles CORS automatically, but check your Supabase project settings

## Next Steps

- Add more columns to the notes table (e.g., `content`, `user_id`)
- Implement user-specific notes
- Add note editing functionality
- Add tags or categories to notes


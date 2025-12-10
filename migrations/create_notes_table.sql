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


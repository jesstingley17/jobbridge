# Running Database Migrations

Your app uses Drizzle ORM for database schema management. Here's how to run migrations.

## Option 1: Using Drizzle Kit Push (Recommended)

This syncs your schema directly to the database:

```bash
npm run db:push
```

**Note:** Requires `DATABASE_URL` environment variable to be set.

## Option 2: Run Migrations on Vercel

Since your database is on Vercel/Supabase, you have a few options:

### A. Run via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```

3. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

4. **Run migrations**:
   ```bash
   npm run db:push
   ```

### B. Run via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL files from the `migrations/` folder:
   - `migrations/create_community_tables.sql`
   - `migrations/create_notes_table.sql`
   - `migrations/add_user_consent_fields.sql`

### C. Use Drizzle Kit Generate + Migrate

If you want to generate migration files first:

```bash
# Generate migration files from schema changes
npx drizzle-kit generate

# Apply migrations (if you have a migration runner)
npx drizzle-kit migrate
```

## Option 3: Run SQL Files Directly

The SQL files in `migrations/` can be run directly in your database:

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy and paste the SQL from each migration file
   - Run them in order

2. **Via psql:**
   ```bash
   psql $DATABASE_URL -f migrations/create_community_tables.sql
   psql $DATABASE_URL -f migrations/create_notes_table.sql
   psql $DATABASE_URL -f migrations/add_user_consent_fields.sql
   ```

## Quick Check: Are Tables Created?

You can verify tables exist by checking your Supabase dashboard:
- Go to **Table Editor**
- You should see tables like: `users`, `jobs`, `applications`, `community_posts`, etc.

## Troubleshooting

**Error: "relation does not exist"**
- Tables haven't been created yet
- Run migrations using one of the methods above

**Error: "DATABASE_URL not set"**
- Set `DATABASE_URL` in your `.env` file locally
- Or use Vercel CLI to pull env vars: `vercel env pull .env.local`

**Error: "Permission denied"**
- Make sure your database user has CREATE TABLE permissions
- Check your Supabase project settings

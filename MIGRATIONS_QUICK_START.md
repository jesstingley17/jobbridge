# 🚀 Quick Migration Guide

## The Problem
You tried to run `migrations/create_community_tables.sql` but got an error because you pasted the **filename** instead of the **SQL content**.

## ✅ Solution: Run All Migrations at Once

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy the SQL Content
1. Open the file: `migrations/run-all-migrations.sql`
2. **Copy ALL the SQL code** (not the filename!)
3. Paste it into the Supabase SQL Editor

### Step 3: Run It
1. Click the **Run** button (or press Cmd/Ctrl + Enter)
2. Wait for it to complete
3. You should see "Success. No rows returned"

## ✅ Verify It Worked

Go to **Table Editor** in Supabase and check that these tables exist:
- ✅ `users` (should already exist)
- ✅ `community_posts`
- ✅ `post_comments`
- ✅ `post_reactions`
- ✅ `community_groups`
- ✅ `forums`
- ✅ `notes`
- ✅ And many more...

## 🎯 What This Does

This migration creates:
- All community-related tables (posts, comments, groups, forums, events)
- The notes table
- Adds consent fields to the users table
- Creates all necessary indexes

## ⚠️ Important Notes

- **Don't paste the filename** - paste the SQL code inside the file
- The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- If a table already exists, it won't be recreated

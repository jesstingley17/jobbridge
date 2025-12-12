# Quick Test Guide

## Step 1: Run Database Migration

Before testing, make sure the database tables exist:

```bash
npm run db:push
```

Or if that doesn't work, manually run the SQL:
```bash
# Connect to your database and run:
psql $DATABASE_URL -f migrations/create_community_tables.sql
```

## Step 2: Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:5000` (or check your configured port).

## Step 3: Test in Browser

1. **Open**: `http://localhost:5000/community`
2. **Login** if not already logged in
3. **Click "Feed" tab**
4. **Create a test post**:
   - Click "What's on your mind?"
   - Type: "Hello community! 🎉"
   - Click "Post"
5. **Test interactions**:
   - Click ❤️ to like
   - Click 💬 to comment
   - Type a comment and press Enter

## Step 4: Check Other Tabs

- **Groups**: Should show available groups (or empty state)
- **Events**: Should show upcoming events (or empty state)
- **Mentors**: Should show available mentors
- **Messages**: Should show empty state

## Quick API Test

You can also test the API directly:

```bash
# Get posts (replace with your session cookie)
curl http://localhost:5000/api/community/posts \
  -H "Cookie: your-session-cookie"

# Create a post (replace with your session cookie)
curl -X POST http://localhost:5000/api/community/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"content": "Test from API", "isPublic": true}'
```

## Troubleshooting

**If you see errors:**
1. Check server logs in terminal
2. Check browser console (F12)
3. Verify database migration ran
4. Make sure you're logged in

**If posts don't appear:**
- Check network tab in browser DevTools
- Verify API returns 200 status
- Check for CORS or authentication errors

## Expected Behavior

✅ Posts appear immediately after creation
✅ Likes toggle on/off
✅ Comments appear below posts
✅ All tabs load without errors
✅ Empty states show when no data exists

Ready to test! 🚀



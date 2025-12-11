# Community System Testing Guide

## Prerequisites

1. **Database Migration**: Make sure you've run the migration to create the community tables:
   ```bash
   npm run db:push
   ```
   Or manually run: `migrations/create_community_tables.sql`

2. **Server Running**: The dev server should be running on `http://localhost:5000` (or your configured port)

3. **User Account**: You need to be logged in to test community features

## Testing Checklist

### ✅ 1. Community Feed

**Location**: `/community` → "Feed" tab

**Test Steps**:
- [ ] Navigate to `/community` page
- [ ] Click on "Feed" tab
- [ ] See the "What's on your mind?" button
- [ ] Click to create a new post
- [ ] Type a test post (e.g., "Hello community! Testing the new feed feature 🎉")
- [ ] Click "Post" button
- [ ] Verify post appears in the feed
- [ ] Check that your name and avatar show correctly
- [ ] Verify timestamp shows correctly (e.g., "just now")

**Expected Results**:
- Post appears immediately after creation
- Post shows author name and avatar
- Post shows creation time
- Empty state shows if no posts exist

### ✅ 2. Post Interactions

**Test Steps**:
- [ ] Click the heart icon to like a post
- [ ] Verify like count increases
- [ ] Click heart again to unlike
- [ ] Click the comment icon
- [ ] Type a test comment
- [ ] Press Enter or click "Post"
- [ ] Verify comment appears below the post
- [ ] Check comment count increases

**Expected Results**:
- Likes toggle on/off correctly
- Like count updates in real-time
- Comments appear immediately
- Comment count updates

### ✅ 3. Post Management

**Test Steps**:
- [ ] Create a post as yourself
- [ ] Click the three dots menu (⋯) on your post
- [ ] Click "Delete"
- [ ] Verify post is removed from feed

**Expected Results**:
- Only your own posts show the menu
- Delete option works correctly
- Post disappears after deletion

### ✅ 4. Groups

**Location**: `/community` → "Groups" tab

**Test Steps**:
- [ ] Navigate to "Groups" tab
- [ ] See list of available groups (if any exist)
- [ ] Click "Join" button on a group
- [ ] Verify success message appears
- [ ] Check member count increases

**Expected Results**:
- Groups display with name, description, member count
- Join button works
- Success notification appears
- Member count updates

**Note**: Groups need to be created first (via API or database). You can create test groups using:
```sql
INSERT INTO community_groups (name, description, slug, owner_id, is_public)
VALUES ('Test Group', 'A test group', 'test-group', 'YOUR_USER_ID', true);
```

### ✅ 5. Events

**Location**: `/community` → "Events" tab

**Test Steps**:
- [ ] Navigate to "Events" tab
- [ ] See list of upcoming events (if any exist)
- [ ] Click "Register" button on an event
- [ ] Verify success message appears
- [ ] Check attendee count increases

**Expected Results**:
- Events display with title, date, location
- Register button works
- Success notification appears
- Attendee count updates

**Note**: Events need to be created first (via API or database). You can create test events using:
```sql
INSERT INTO community_events (title, description, slug, organizer_id, start_date, is_public)
VALUES ('Test Event', 'A test event', 'test-event', 'YOUR_USER_ID', NOW() + INTERVAL '7 days', true);
```

### ✅ 6. Mentors (Existing Feature)

**Location**: `/community` → "Mentors" tab

**Test Steps**:
- [ ] Navigate to "Mentors" tab
- [ ] See list of available mentors
- [ ] Click "Connect" on a mentor
- [ ] Type a connection message
- [ ] Click "Send Request"
- [ ] Verify success message

**Expected Results**:
- Mentors display correctly
- Connection request sends successfully
- Success notification appears

### ✅ 7. API Testing (Optional)

You can also test the API directly using curl or Postman:

**Create a Post**:
```bash
curl -X POST http://localhost:5000/api/community/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "content": "Test post from API",
    "postType": "post",
    "isPublic": true
  }'
```

**Get Posts**:
```bash
curl http://localhost:5000/api/community/posts \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Get Groups**:
```bash
curl http://localhost:5000/api/community/groups \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Get Events**:
```bash
curl http://localhost:5000/api/community/events \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

## Common Issues & Solutions

### Issue: "No posts yet" or empty feed
**Solution**: Create a test post using the "What's on your mind?" button

### Issue: "Failed to create post" error
**Solution**: 
- Check that you're logged in
- Check browser console for errors
- Verify database migration ran successfully
- Check server logs for errors

### Issue: Groups/Events tabs show "No groups/events yet"
**Solution**: This is expected if no groups/events exist. Create test data using SQL (see above) or wait for the create UI to be implemented.

### Issue: Database errors
**Solution**: 
- Run the migration: `npm run db:push`
- Or manually run: `migrations/create_community_tables.sql`
- Check that `DATABASE_URL` environment variable is set

### Issue: Authentication errors
**Solution**: 
- Make sure you're logged in
- Check that session cookies are being set
- Verify `isAuthenticated` middleware is working

## Browser Console Checks

Open browser DevTools (F12) and check:

1. **Network Tab**: 
   - API requests should return 200 status
   - Check for any 401 (unauthorized) or 500 (server error) responses

2. **Console Tab**:
   - Should be no red errors
   - Check for any React warnings

3. **Application Tab**:
   - Check that session cookies are set
   - Verify localStorage if used

## Next Steps After Testing

Once basic functionality is confirmed:

1. ✅ Test with multiple users (create posts, interact)
2. ✅ Test edge cases (very long posts, special characters)
3. ✅ Test mobile responsiveness
4. ✅ Test accessibility (keyboard navigation, screen readers)
5. ✅ Performance test with many posts
6. ✅ Add more features (group creation, event creation, forums)

## Reporting Issues

If you find bugs or issues:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check server logs for errors
4. Note your browser and OS version
5. Take screenshots if helpful

Happy testing! 🚀


# Contentful Troubleshooting Guide

## Quick Diagnostic Test

1. **Log in to your admin panel**: `https://thejobbridge-inc.com/admin/blog`
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Run this in the console**:
   ```javascript
   fetch('/api/contentful/test', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('sb-auth-token') || ''}`
     }
   }).then(r => r.json()).then(console.log)
   ```

Or visit: `https://thejobbridge-inc.com/api/contentful/test` (requires admin login)

## Common Issues & Fixes

### Issue 1: "Contentful not configured"

**Symptoms:**
- Error message says "Set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN"
- Diagnostic shows `configured: false`

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `CONTENTFUL_SPACE_ID` - Your Contentful Space ID
   - `CONTENTFUL_ACCESS_TOKEN` - Your Content Delivery API token
   - `CONTENTFUL_MANAGEMENT_TOKEN` (optional) - For creating/updating posts from admin panel
   - `CONTENTFUL_ENVIRONMENT` (optional) - Defaults to 'master'
3. Redeploy your project

### Issue 2: "No blog posts found"

**Symptoms:**
- Diagnostic shows `blogPostsFound: 0`
- But `totalEntries` > 0

**Possible Causes:**
1. **Wrong content type name** - Your content type might be named differently
   - Check the diagnostic output for `contentTypes` array
   - Common names: `blogPost`, `blog_post`, `Blog page`, `blogPage`
   - Update your content type name in Contentful to match one of these, OR
   - Update the code in `server/contentful.ts` line 102 to include your content type name

2. **No published entries** - Posts exist but aren't published
   - Go to Contentful → Your content type → Publish the entries

3. **Wrong environment** - Posts are in a different environment
   - Check `CONTENTFUL_ENVIRONMENT` variable
   - Default is 'master'

**Fix:**
- Check diagnostic output for available content types
- Rename your content type in Contentful to match: `blogPost`
- Or update the code to use your content type name

### Issue 3: "Invalid access token" or "401 Unauthorized"

**Symptoms:**
- Error message includes "401" or "Unauthorized"
- Diagnostic shows `testResults.cdaConnection: "FAILED"`

**Fix:**
1. Go to Contentful → Settings → API keys
2. Make sure you're using the **Content Delivery API** token (not Management API)
3. Copy the token and update `CONTENTFUL_ACCESS_TOKEN` in Vercel
4. Redeploy

### Issue 4: "Space not found" or "404"

**Symptoms:**
- Error message includes "404" or "Not Found"
- Diagnostic shows connection failed

**Fix:**
1. Check `CONTENTFUL_SPACE_ID` in Vercel
2. Find your Space ID in Contentful: Settings → General settings → Space ID
3. Make sure it matches exactly (no extra spaces)

### Issue 5: "Management API error"

**Symptoms:**
- Can read posts but can't create/update from admin panel
- Diagnostic shows `testResults.managementApi: "FAILED"`

**Fix:**
1. Go to Contentful → Settings → API keys
2. Create a **Content Management API** token
3. Add it as `CONTENTFUL_MANAGEMENT_TOKEN` in Vercel
4. Redeploy

## Required Contentful Content Type Fields

Your content type should have these fields:

- `title` (Short text)
- `slug` (Short text, unique)
- `content` (Long text or Rich text)
- `excerpt` (Short text, optional)
- `featuredImage` (Media, optional)
- `tags` (Short text, list, optional)
- `authorName` (Short text, optional)
- `publishedDate` (Date & time, optional)
- `published` (Boolean, optional)

## Testing Steps

1. **Test Connection**: Visit `/api/contentful/test` (admin required)
2. **Check Diagnostics**: Look at the `diagnostics` object in the response
3. **Verify Content Types**: Check `diagnostics.contentTypes` array
4. **Check Posts**: Look at `diagnostics.blogPosts` array
5. **Try Sync**: Click "Sync from Contentful" button in admin panel

## Still Not Working?

1. **Check Vercel Logs**: 
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for Contentful-related errors

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables**:
   - Make sure all variables are set in Vercel
   - Check for typos in variable names
   - Ensure values don't have extra spaces

4. **Test Contentful Directly**:
   - Use Contentful's web app to verify your space and content
   - Make sure you have at least one published entry

## Quick Checklist

- [ ] `CONTENTFUL_SPACE_ID` is set in Vercel
- [ ] `CONTENTFUL_ACCESS_TOKEN` is set in Vercel (Content Delivery API token)
- [ ] `CONTENTFUL_MANAGEMENT_TOKEN` is set (optional, for admin panel)
- [ ] Content type exists in Contentful
- [ ] Content type name matches: `blogPost`, `blog_post`, `Blog page`, or `blogPage`
- [ ] At least one entry is published
- [ ] Project has been redeployed after setting environment variables

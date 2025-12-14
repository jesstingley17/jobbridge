# Contentful Configuration Guide

Follow these steps to configure Contentful for your blog.

## Step 1: Create Contentful Account & Space

1. Go to [contentful.com](https://www.contentful.com) and sign up (or log in)
2. Create a new space or use an existing one
3. Note your **Space ID** (you'll need this later)

## Step 2: Create Blog Post Content Type

1. In Contentful, go to **Content model** → **Add content type**
2. Name it exactly: `blogPost` (case-sensitive, must match)
3. Click **Create**

### Add Required Fields:

Click **Add field** for each of these:

1. **Title** (Short text)
   - Field ID: `title`
   - Required: ✅ Yes
   - Help text: "Blog post title"

2. **Slug** (Short text)
   - Field ID: `slug`
   - Required: ✅ Yes
   - Unique: ✅ Yes
   - Help text: "URL-friendly slug (e.g., 'my-blog-post')"

3. **Content** (Long text)
   - Field ID: `content`
   - Required: ✅ Yes
   - Help text: "Blog post content (markdown supported)"

4. **Excerpt** (Long text)
   - Field ID: `excerpt`
   - Required: ❌ No
   - Help text: "Brief description for blog listing"

5. **Featured Image** (Media)
   - Field ID: `featuredImage`
   - Required: ❌ No
   - Help text: "Main image for the blog post"

6. **Tags** (Short text, list)
   - Field ID: `tags`
   - Required: ❌ No
   - Help text: "Tags for categorizing posts"

7. **Published** (Boolean)
   - Field ID: `published`
   - Required: ❌ No
   - Default: `true`
   - Help text: "Whether the post is published"

8. **Published Date** (Date & time)
   - Field ID: `publishedDate`
   - Required: ❌ No
   - Help text: "When the post was/will be published"

9. **Author** (Short text)
   - Field ID: `authorName`
   - Required: ❌ No
   - Help text: "Author name"

10. Click **Save** to save the content type

## Step 3: Get API Credentials

1. In Contentful, go to **Settings** → **API keys**
2. Click **Add API key** (or use existing)
3. Name it: `The JobBridge Blog API Key`
4. Copy these values:
   - **Space ID** (e.g., `abc123xyz`)
   - **Content Delivery API - access token** ⭐ **Use this one!** (for published content)
   
   **Important:** Use the **Content Delivery API** token, NOT the Content Preview API token. The Delivery API is for reading published content, which is what your blog displays.

## Step 4: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **The-JobBridge-Inc**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Variables:

```
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_content_delivery_api_token_here
```

**Note:** Use the **Content Delivery API - access token** (not the Preview API token). This token reads published content for your blog.

### Optional: Content Management API (CMA) Token

If you want to create/update/delete posts in Contentful from your admin panel:

1. In Contentful, go to **Settings** → **API keys**
2. Click **Content Management API tokens** tab
3. Click **Generate personal token** (or use existing)
4. Copy the token
5. Add to Vercel:
   ```
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
   ```

**Note:** The CMA token allows your admin panel to sync changes back to Contentful. Without it, you can still:
- Read posts from Contentful (using Delivery API)
- Create/edit posts in your database (won't sync to Contentful)

### Optional Variables:

```
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_WEBHOOK_SECRET=your_random_secret_here
```

5. For each variable:
   - Click **Add New**
   - Enter the **Key** (e.g., `CONTENTFUL_SPACE_ID`)
   - Enter the **Value** (paste from Contentful)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

6. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

## Step 5: Test the Integration

1. **Create a test blog post in Contentful:**
   - Go to **Content** → **Add entry**
   - Select `blogPost`
   - Fill in:
     - Title: "Test Blog Post"
     - Slug: "test-blog-post"
     - Content: "This is a test post from Contentful"
     - Published: ✅ true
   - Click **Publish**

2. **Sync from your admin panel:**
   - Go to `https://thejobbridge-inc.com/admin/blog`
   - Click **Sync from Contentful** button
   - You should see: "Sync Complete - Synced X posts from Contentful"

3. **Verify on your blog:**
   - Go to `https://thejobbridge-inc.com/blog`
   - Your test post should appear

## Step 6: Set Up Webhook (Optional - for Real-time Sync)

For automatic syncing when you publish in Contentful:

1. **Get your webhook URL:**
   - Your webhook endpoint: `https://thejobbridge-inc.com/api/contentful/webhook`

2. **In Contentful:**
   - Go to **Settings** → **Webhooks**
   - Click **Add webhook**
   - Name: `The JobBridge Database Sync`
   - URL: `https://thejobbridge-inc.com/api/contentful/webhook`
   - Triggers:
     - ✅ Entry publish
     - ✅ Entry unpublish
     - ✅ Entry update
   - Environment: `master`
   - Webhook secret: (generate a random string, add to `CONTENTFUL_WEBHOOK_SECRET` in Vercel)
   - Click **Save**

3. **Add webhook secret to Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Add: `CONTENTFUL_WEBHOOK_SECRET=your_secret_here`
   - Redeploy

## Troubleshooting

### "Contentful not configured" warning
- Check that `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` are set in Vercel
- Make sure you redeployed after adding the variables

### Posts not syncing
- Check Contentful API key has read permissions
- Verify content type is named exactly `blogPost`
- Check browser console for errors
- Try manual sync from admin panel

### Webhook not working
- Verify webhook URL is correct
- Check `CONTENTFUL_WEBHOOK_SECRET` matches in both places
- Check Vercel function logs for errors

## How It Works

1. **Contentful** = Your content management system (where you write/edit posts)
2. **Your Database** = Stores synced posts for fast retrieval
3. **Sync Process:**
   - Manual: Click "Sync from Contentful" in admin panel
   - Automatic: When someone visits `/blog`, it syncs in background
   - Webhook: When you publish in Contentful, it syncs immediately

## Editing Posts

You can edit posts in two ways:

1. **In Contentful** (recommended for content writers):
   - Edit in Contentful CMS
   - Publish → Auto-syncs to your site

2. **In Admin Panel** (`/admin/blog`):
   - Edit directly in your database
   - Changes stay in your database only (won't sync back to Contentful)

**Note:** Posts edited in the admin panel won't sync back to Contentful. Use Contentful as the source of truth if you want to manage content there.

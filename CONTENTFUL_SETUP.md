# Contentful Integration Setup

This guide will help you set up Contentful integration for automated blog posts.

## 1. Create a Contentful Account

1. Go to [contentful.com](https://www.contentful.com) and sign up
2. Create a new space (or use an existing one)

## 2. Create a Content Type

1. In Contentful, go to **Content model** → **Add content type**
2. Name it `blogPost` (this must match exactly)
3. Add the following fields:

   - **Title** (Short text) - Field ID: `title`
   - **Slug** (Short text) - Field ID: `slug` (unique)
   - **Excerpt** (Long text) - Field ID: `excerpt` (optional)
   - **Content** (Long text, markdown) - Field ID: `content`
   - **Featured Image** (Media) - Field ID: `featuredImage` (optional)
   - **Tags** (Short text, list) - Field ID: `tags` (optional)
   - **Author** (Reference, single entry) - Field ID: `author` (optional)
   - **Published** (Boolean) - Field ID: `published` (default: true)
   - **Published Date** (Date & time) - Field ID: `publishedDate` (optional)

4. Save the content type

## 3. Get API Credentials

1. Go to **Settings** → **API keys**
2. Copy your **Space ID**
3. Copy your **Content Delivery API - access token** (for reading)
4. Copy your **Content Management API - access token** (for webhooks, optional)

## 4. Set Environment Variables

Add these to your `.env` file or Vercel environment variables:

```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_api_token
CONTENTFUL_ENVIRONMENT=master  # Optional, defaults to 'master'
CONTENTFUL_WEBHOOK_SECRET=your_webhook_secret  # Optional, for webhook security
```

## 5. Configure Webhook (Optional but Recommended)

1. In Contentful, go to **Settings** → **Webhooks**
2. Click **Add webhook**
3. Set the webhook URL to: `https://your-domain.com/api/contentful/webhook`
4. Select events:
   - Entry publish
   - Entry unpublish
   - Entry update
5. Set the webhook secret (use a random string)
6. Save the webhook

## 6. Create Your First Blog Post

1. Go to **Content** → **Add entry**
2. Select `blogPost` content type
3. Fill in the fields:
   - Title: "Welcome to The JobBridge Blog"
   - Slug: "welcome-to-the-jobbridge-blog"
   - Content: Your blog post content (markdown supported)
   - Published: true
   - Published Date: Today's date
4. Click **Publish**

## 7. Sync Posts

Posts will automatically sync when:
- Someone visits `/blog` (background sync)
- Someone visits a specific blog post (if not in database)
- A webhook is triggered (if configured)
- You manually trigger sync via `/api/contentful/sync` (requires authentication)

## 8. Manual Sync (Admin Only)

To manually sync all posts from Contentful:

```bash
curl -X POST https://your-domain.com/api/contentful/sync \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Notes

- The content type ID must be exactly `blogPost` (case-sensitive)
- Posts are synced to your database for fast retrieval
- The webhook ensures real-time updates when you publish in Contentful
- If Contentful is not configured, the blog will work with existing database posts


# Vercel Deploy Hook Setup for Contentful

## Quick Setup Guide

### Step 1: Create Deploy Hook in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in and select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** → **Git**

3. **Create Deploy Hook**
   - Scroll to **Deploy Hooks** section
   - Click **Add Hook**
   - Fill in:
     - **Name**: `Contentful Deploy Hook`
     - **Branch**: `main` (or your production branch)
   - Click **Create Hook**

4. **Copy the Hook URL**
   - You'll see a URL like:
     ```
     https://api.vercel.com/v1/integrations/deploy/xxxxx/yyyyy
     ```
   - **Copy this URL** - you'll need it for Contentful

### Step 2: Configure in Contentful

1. **Go to Contentful**
   - Sign in to your Contentful space
   - Navigate to **Settings** → **Webhooks**

2. **Add Vercel Webhook**
   - Click **Add webhook**
   - Select **Vercel** template (or create custom)
   - Paste your **Vercel deploy hook URL** from Step 1.4
   - Configure triggers:
     - ✅ Entry publish
     - ✅ Entry unpublish
   - Set **Environment**: `master`
   - Click **Save**

### Step 3: Test It

1. **Publish a blog post** in Contentful
2. **Check Vercel Dashboard** - you should see a new deployment triggered automatically
3. **Wait for deployment** to complete
4. **Visit your site** - new content should be live!

## How It Works

```
Contentful (Publish Post)
    ↓
Webhook triggers
    ↓
Vercel Deploy Hook called
    ↓
New deployment starts
    ↓
Site rebuilds with latest content
    ↓
New version goes live
```

## Troubleshooting

### Deploy hook not triggering?
- ✅ Verify the URL is correct (no extra spaces)
- ✅ Check Contentful webhook is enabled
- ✅ Ensure you're publishing in the `master` environment
- ✅ Check Vercel deployment logs

### Deployments too frequent?
- Consider using the database sync webhook instead (doesn't trigger deployments)
- Or manually trigger deployments when needed

### Need to update the hook?
- Go to Vercel → Settings → Git → Deploy Hooks
- Click on your hook to view/edit
- Or create a new one and update Contentful

## Alternative: Database Sync Only

If you don't want automatic deployments, you can use the database sync webhook instead:
- URL: `https://your-domain.com/api/contentful/webhook`
- This syncs content to your database without triggering Vercel deployments
- Content updates immediately without rebuilding


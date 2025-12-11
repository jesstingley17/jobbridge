# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for The Job Bridge application using Supabase.

## Prerequisites

- Supabase project configured
- Google Cloud Console access
- Application running on Vercel or locally

## Step 1: Create a Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   https://thejobbridge-inc.com/auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback?provider=google
   ```
7. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase OAuth Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** provider
4. Toggle it **ON**
5. Paste your **Google Client ID** and **Client Secret**
6. Click **Save**

## Step 3: Environment Variables

Add to Vercel environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## How It Works

1. User clicks "Sign in with Google" button
2. Client redirects to Google login via Supabase
3. User authenticates with Google
4. Google redirects back with authentication token
5. Supabase automatically creates/updates user in database
6. User is logged in and redirected to dashboard

## Testing

For local development:
- Update Google Cloud Console redirect URI to `http://localhost:5173/auth/callback`
- Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in `.env.local`
- Click "Sign in with Google" button

## Troubleshooting

### "Invalid redirect URI"
- Verify redirect URI in Google Cloud Console
- Local: `http://localhost:5173/auth/callback`
- Production: `https://thejobbridge-inc.com/auth/callback`

### "Provider not configured"
- Ensure Google OAuth is toggled ON in Supabase
- Verify Client ID and Client Secret are entered correctly

## Additional OAuth Providers

Supabase supports GitHub, Discord, Apple, and others. Add them the same way:

1. Enable provider in Supabase Authentication → Providers
2. Enter provider credentials
3. Add buttons to auth UI as needed

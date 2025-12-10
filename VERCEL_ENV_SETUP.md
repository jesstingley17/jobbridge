# Vercel Environment Variables Setup

## AI Gateway API Key

You've received your Vercel AI Gateway API key. Here's how to add it to your Vercel project:

### Steps to Add Environment Variable in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (jobbridge)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Key**: `AI_GATEWAY_API_KEY`
   - **Value**: `vck_1mSK3aN8Mz1YftRCP4uJ1Ulp8z8AfNIxL96S3BXobNdl6HObhp2uNGGn`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### Important Notes:

⚠️ **Security Warning**: 
- This key grants full AI Gateway API access
- Never commit this key to your repository
- The `.env` file is already in `.gitignore`
- Only add it to Vercel's environment variables

### Using the Key in Your Code:

If you need to use the AI Gateway API key in your application, access it via:

```typescript
const apiKey = process.env.AI_GATEWAY_API_KEY;
```

### Other Required Environment Variables:

Make sure you also have these set in Vercel:

- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `OPENAI_API_KEY` - Your OpenAI API key
- `RESEND_API_KEY` - Your Resend email API key
- `FROM_EMAIL` - Sender email address
- `CONTACT_EMAIL` - Contact email (info@thejobbridge-inc.com)
- `HELP_EMAIL` - Help email (help@thejobbridge-inc.com)
- `SESSION_SECRET` - A random secret for session encryption

### After Adding Variables:

1. Redeploy your application for changes to take effect
2. Or trigger a new deployment from the Vercel dashboard


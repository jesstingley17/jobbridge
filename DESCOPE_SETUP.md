# Descope Authentication Setup

## Environment Variables

Add these to your Vercel environment variables:

```bash
DESCOPE_DISCOVERY_URL="https://api.descope.com/v1/apps/P36fWptyQjsUg70TmV5yNw6e6pdD/.well-known/openid-configuration"
DESCOPE_ISSUER="https://api.descope.com/v1/apps/P36fWptyQjsUg70TmV5yNw6e6pdD"
NEXT_PUBLIC_DESCOPE_PROJECT_ID="P36fWptyQjsUg70TmV5yNw6e6pdD"
NEXT_PUBLIC_DESCOPE_BASE_URL="https://api.descope.com"
```

Note: `NEXT_PUBLIC_DESCOPE_PROJECT_ID` appears twice in the provided config - use it once.

## Setup Steps

### 1. Pull Environment Variables Locally

```bash
vercel env pull
```

This will create/update your `.env.local` file with the environment variables from Vercel.

### 2. Add to Vercel Dashboard

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable above
4. Make sure to set them for all environments (Production, Preview, Development)

### 3. Integration Options

You can integrate Descope in two ways:

#### Option A: Replace Replit Auth with Descope (Recommended for new projects)
- Update `server/replitAuth.ts` to use Descope OIDC
- Update authentication routes to use Descope

#### Option B: Add Descope alongside existing auth
- Keep existing email/password auth
- Add Descope as an additional authentication method
- Allow users to choose their preferred method

## Next Steps

After setting up environment variables, we can:
1. Install Descope SDK: `npm install @descope/node-sdk`
2. Update authentication middleware
3. Add Descope login/signup UI components
4. Integrate with existing user system

Would you like me to implement the Descope integration now?


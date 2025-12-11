# Descope Authentication Integration

## Environment Variables Required

Add these to your Vercel project settings (Environment Variables):

```
DESCOPE_DISCOVERY_URL=https://api.descope.com/v1/apps/P36fWptyQjsUg70TmV5yNw6e6pdD/.well-known/openid-configuration
DESCOPE_ISSUER=https://api.descope.com/v1/apps/P36fWptyQjsUg70TmV5yNw6e6pdD
NEXT_PUBLIC_DESCOPE_PROJECT_ID=P36fWptyQjsUg70TmV5yNw6e6pdD
NEXT_PUBLIC_DESCOPE_BASE_URL=https://api.descope.com
```

## Quick Setup

### 1. Pull Environment Variables

If you have Vercel CLI installed:
```bash
vercel env pull
```

Or manually add them to:
- Vercel Dashboard → Project Settings → Environment Variables
- Local `.env.local` file (for development)

### 2. Install Descope SDK

```bash
npm install @descope/node-sdk @descope/react-sdk
```

### 3. Integration Options

**Option A: Replace Current Auth with Descope**
- Replace Replit Auth with Descope OIDC
- Update all authentication routes
- Migrate existing users

**Option B: Add Descope as Additional Auth Method**
- Keep email/password auth
- Add Descope login button
- Allow users to choose

## Current Status

Your app currently uses:
- Email/Password authentication (custom)
- Replit Auth (OIDC) - for development
- Session-based authentication

## Next Steps

1. **Fix the current 500 error first** (registration issue)
2. **Then integrate Descope** as an additional authentication option
3. **Or replace** the current auth system with Descope

Would you like me to:
- A) Fix the registration error first, then add Descope?
- B) Implement Descope integration now (may help with the error)?
- C) Just document the setup for you to implement later?


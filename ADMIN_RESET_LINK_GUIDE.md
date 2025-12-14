# Admin Password Reset Link Generator

This guide explains how to generate one-time password reset links for admin users using Supabase's native recovery system.

## Prerequisites

1. **Environment Variables** (set in Vercel):
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
   - `ADMIN_RESET_TOKEN` - A long random string for securing the endpoint (e.g., generate with `openssl rand -hex 32`)
   - `ADMIN_EMAILS` - Comma-separated list of admin emails (optional)
   - `ADMIN_EMAIL_PATTERN` - Regex pattern for admin emails (optional)
   - `SITE_URL` - Your site URL (defaults to `https://thejobbridge-inc.com`)

2. **Supabase Dashboard Configuration**:
   - Go to **Settings → Authentication → URL Configuration**
   - Ensure `https://thejobbridge-inc.com/admin/login` is in **Redirect URLs**

## Usage

### Option 1: Using the API Endpoint (Recommended)

The endpoint `/api/admin/generate-reset-link` generates a Supabase recovery link directly.

**Security**: This endpoint requires an `x-admin-token` header to prevent abuse.

#### Generate Reset Link via cURL

```bash
# Replace ADMIN_RESET_TOKEN with your actual token from environment variables
# Replace EMAIL with the admin's email address

curl -X POST https://thejobbridge-inc.com/api/admin/generate-reset-link \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_RESET_TOKEN" \
  -d '{"email":"jtingley@thejobbridge-inc.com"}'
```

#### Response

```json
{
  "success": true,
  "email": "jtingley@thejobbridge-inc.com",
  "link": "https://PROJECT_REF.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://thejobbridge-inc.com/admin/login",
  "expiresAt": "2025-01-15T12:00:00Z",
  "message": "Recovery link generated successfully. Send this link to the admin user."
}
```

**Copy the `link` value and send it to the admin user.** When they click it, they'll be redirected to `/admin/login` to set a new password.

### Option 2: Using Supabase Edge Function (Alternative)

If you prefer using Supabase's Edge Function approach, you can deploy the `generate-magic-link` function. However, the API endpoint above is simpler and doesn't require deploying an Edge Function.

## How It Works

1. **Verification**: 
   - Checks `x-admin-token` header matches `ADMIN_RESET_TOKEN`
   - Verifies user exists in database
   - Confirms user is an admin (by role, email list, or pattern)

2. **Supabase Lookup**:
   - Finds the user in Supabase Auth by email
   - Uses Supabase Admin API to generate recovery link

3. **Link Generation**:
   - Creates a one-time recovery link
   - Sets redirect to `/admin/login`
   - Returns the link for you to send to the admin

4. **Password Reset**:
   - Admin clicks the link
   - Supabase validates the token
   - Redirects to `/admin/login`
   - Admin sets new password via Supabase's native flow

## Security Considerations

1. **Admin Token**: The `ADMIN_RESET_TOKEN` should be a long, random string. Never commit it to git.

2. **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all security. Keep it secret and never expose it in client-side code.

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse of this endpoint.

4. **Audit Logging**: The endpoint logs all reset link generation attempts for security auditing.

## Troubleshooting

### "User not found in Supabase Auth"

**Cause**: User exists in database but hasn't signed up via Supabase Auth yet.

**Solution**: Have the user sign up via Supabase Auth first (email/password or magic link), then generate the reset link.

### "User is not an admin"

**Cause**: User exists but doesn't meet admin criteria.

**Solution**: 
- Add their email to `ADMIN_EMAILS` environment variable, OR
- Update their `role` to `'admin'` in the database, OR
- Ensure their email matches `ADMIN_EMAIL_PATTERN`

### "Unauthorized" error

**Cause**: Missing or incorrect `x-admin-token` header.

**Solution**: Ensure you're sending the correct `ADMIN_RESET_TOKEN` value in the `x-admin-token` header.

### Link doesn't work

**Cause**: Link may have expired or redirect URL not configured.

**Solution**:
- Check Supabase Dashboard → Authentication → Redirect URLs includes `/admin/login`
- Generate a new link (they expire after a set time)
- Ensure the link is used within the expiration window

## Example: Complete Workflow

1. **Set Environment Variables** in Vercel:
   ```
   ADMIN_RESET_TOKEN=your-long-random-string-here
   ADMIN_EMAILS=jtingley@thejobbridge-inc.com,admin@example.com
   ```

2. **Generate Reset Link**:
   ```bash
   curl -X POST https://thejobbridge-inc.com/api/admin/generate-reset-link \
     -H "Content-Type: application/json" \
     -H "x-admin-token: your-long-random-string-here" \
     -d '{"email":"jtingley@thejobbridge-inc.com"}'
   ```

3. **Send Link to Admin**: Copy the `link` from the response and send it via secure channel (email, Slack, etc.)

4. **Admin Resets Password**: Admin clicks link, gets redirected to `/admin/login`, sets new password.

## Alternative: Direct Supabase Admin API

If you prefer to call Supabase directly without going through your API:

```bash
curl -X POST 'https://PROJECT_REF.supabase.co/auth/v1/admin/generate_link' \
  -H "Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "recovery",
    "email": "jtingley@thejobbridge-inc.com",
    "options": {
      "redirect_to": "https://thejobbridge-inc.com/admin/login"
    }
  }'
```

**Note**: This requires your `SUPABASE_SERVICE_ROLE_KEY` and `PROJECT_REF`. The API endpoint approach is recommended as it adds an extra security layer and doesn't expose your service role key.

---

**Last Updated**: After implementing Supabase native admin reset link generation
**Status**: Ready for production use

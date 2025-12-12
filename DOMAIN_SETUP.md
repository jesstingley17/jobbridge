# Domain Setup for Vercel

Your domain `thejobbridge-inc.com` needs to be configured in the Vercel dashboard.

## Steps to Configure Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings → Domains**
   - Click on your project
   - Go to the "Settings" tab
   - Click on "Domains" in the sidebar

3. **Add Your Domain**
   - Click "Add Domain"
   - Enter: `thejobbridge-inc.com`
   - Click "Add"

4. **Configure DNS Records**
   Vercel will show you the DNS records you need to add:
   
   **For Root Domain (thejobbridge-inc.com):**
   - Type: `A`
   - Name: `@` or leave blank
   - Value: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
   
   **OR use CNAME:**
   - Type: `CNAME`
   - Name: `@` or leave blank
   - Value: `cname.vercel-dns.com` (check Vercel dashboard for exact value)
   
   **For www subdomain (optional):**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

5. **Update DNS at Your Domain Registrar**
   - Go to your domain registrar (where you bought thejobbridge-inc.com)
   - Find DNS settings
   - Add the records Vercel provided
   - Save changes

6. **Wait for DNS Propagation**
   - DNS changes can take 24-48 hours to propagate
   - Vercel will show the status in the dashboard
   - You can check status at: https://dnschecker.org

7. **Verify SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Once DNS is configured, SSL will be issued automatically
   - This usually takes a few minutes after DNS is verified

## Current Configuration

Your code already has redirects set up in `server/index.ts`:
- Redirects HTTP → HTTPS
- Redirects www → non-www
- Canonical domain: `thejobbridge-inc.com`

## Troubleshooting

**If domain isn't working:**
1. Check DNS propagation: https://dnschecker.org
2. Verify DNS records match what Vercel shows
3. Check Vercel dashboard for any error messages
4. Ensure domain is verified in Vercel (green checkmark)

**If you see "Domain not configured":**
- Make sure you added the domain in Vercel dashboard
- Check that DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)

## Quick Check

Run this command to check your DNS:
```bash
dig thejobbridge-inc.com
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

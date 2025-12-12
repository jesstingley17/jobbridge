# Fix: Vercel Deploying to Wrong Domain

If Vercel is deploying to non-existent domains (like `your-project-abc123.vercel.app`) instead of `thejobbridge-inc.com`, follow these steps:

## Quick Fix: Set Production Domain

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Domains**
   - Click on your project
   - Go to "Settings" tab
   - Click "Domains" in the sidebar

3. **Check Domain Assignment**
   - Find `thejobbridge-inc.com` in the list
   - Look at the "Production" column
   - If it shows "Not assigned" or is unchecked, that's the problem!

4. **Assign to Production**
   - Click the checkbox under "Production" for `thejobbridge-inc.com`
   - Make sure it's checked for Production (not just Preview)

## Alternative: Promote Latest Deployment

If the domain is assigned but deployments aren't going there:

1. **Go to Deployments Tab**
   - Click "Deployments" in your project
   - Find the latest deployment

2. **Promote to Production**
   - Click the three dots (⋯) on the latest deployment
   - Click "Promote to Production"
   - This assigns it to your production domain

## Set Production Branch

Make sure your production branch is configured:

1. **Go to Settings → Git**
   - Check "Production Branch"
   - Should be `main` or `master`
   - All pushes to this branch should deploy to production domain

## Verify Domain Configuration

1. **Check Domain Status**
   - In Settings → Domains
   - `thejobbridge-inc.com` should show:
     - ✅ Status: "Valid Configuration"
     - ✅ Production: Checked
     - ✅ Preview: Optional (can be checked or unchecked)

2. **Check DNS**
   - Domain should point to Vercel
   - Use https://dnschecker.org to verify globally

## Force Production Deployment

If nothing else works:

1. **Remove and Re-add Domain**
   - Remove `thejobbridge-inc.com` from Vercel
   - Add it again
   - Make sure to check "Production" when adding

2. **Redeploy**
   - Make a small change and push to `main`
   - Or manually trigger a redeploy in Vercel dashboard

## Check Deployment Settings

1. **Go to Settings → General**
   - Check "Production Branch" is set correctly
   - Check "Auto-assign Custom Domains" is enabled (if available)

## Common Issues

### Issue: Domain shows "Invalid Configuration"
- DNS records are wrong or not propagated
- Fix DNS at your domain registrar
- Wait for DNS propagation (24-48 hours)

### Issue: Domain only shows in Preview
- Domain is not assigned to Production
- Check the Production checkbox in Settings → Domains

### Issue: Deployments go to vercel.app domain
- Production branch not set correctly
- Domain not assigned to Production
- Check both Settings → Git and Settings → Domains

## Quick Checklist

- [ ] Domain `thejobbridge-inc.com` is added in Vercel
- [ ] Domain shows "Valid Configuration" status
- [ ] **Production checkbox is checked** (most important!)
- [ ] Production branch is set to `main` (or your main branch)
- [ ] Latest deployment is promoted to Production
- [ ] DNS records are correct and propagated

## Still Not Working?

If deployments still go to wrong domains:

1. **Check Vercel Project Settings**
   - Make sure project is not paused
   - Check for any domain restrictions

2. **Contact Vercel Support**
   - They can check domain configuration on their end
   - They can verify DNS and domain assignment

3. **Check Build Logs**
   - Look for any domain-related errors
   - Check if build is successful

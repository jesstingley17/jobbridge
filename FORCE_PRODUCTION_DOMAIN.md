# Force Vercel to Deploy to thejobbridge-inc.com

If Vercel keeps deploying to preview domains (`jobbridge-*.vercel.app`) instead of `thejobbridge-inc.com`, follow these steps:

## Step 1: Verify Domain is Added

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Check if `thejobbridge-inc.com` is in the list
3. If NOT, click "Add Domain" and add `thejobbridge-inc.com`

## Step 2: Assign Domain to Production (CRITICAL)

1. In **Settings** → **Domains**, find `thejobbridge-inc.com`
2. Look for columns: **Production** | **Preview** | **Development**
3. **CHECK the Production checkbox** ✅
4. You can UNCHECK Preview if you only want it on production

## Step 3: Set Production Branch

1. Go to **Settings** → **Git**
2. Check "Production Branch"
3. Should be: `main` (or `master`)
4. All commits to this branch should deploy to Production domain

## Step 4: Promote Current Deployment

1. Go to **Deployments** tab
2. Find the latest deployment (should be from `main` branch)
3. Click the **three dots (⋯)** on that deployment
4. Click **"Promote to Production"**
5. This will assign it to `thejobbridge-inc.com`

## Step 5: Verify DNS is Correct

1. Go to **Settings** → **Domains** → `thejobbridge-inc.com`
2. Vercel will show DNS records you need
3. Check at your domain registrar that DNS matches
4. Use https://dnschecker.org to verify globally

## Step 6: Force a New Deployment

After promoting to production:

1. Make a small change (add a comment, update a file)
2. Commit and push to `main`:
   ```bash
   git commit --allow-empty -m "Force production deployment"
   git push origin main
   ```
3. Check Vercel dashboard - new deployment should go to `thejobbridge-inc.com`

## Troubleshooting

### If Domain Shows "Invalid Configuration"
- DNS records are wrong or not propagated
- Check DNS at your domain registrar
- Wait 24-48 hours for DNS propagation
- Use https://dnschecker.org to check globally

### If Production Checkbox is Grayed Out
- Domain might not be verified yet
- Wait for DNS verification to complete
- Check Vercel dashboard for verification status

### If Deployments Still Go to Preview
1. **Check Branch**: Make sure you're pushing to `main` (production branch)
2. **Check Deployment**: Look at deployment details - which branch is it from?
3. **Manual Promote**: Manually promote each deployment until it sticks
4. **Check Settings**: Go to Settings → General → Production Branch

### If Domain is Not Listed in Deployment
1. The domain might not be assigned to Production
2. Go back to Step 2 and verify Production checkbox is checked
3. Try removing and re-adding the domain

## Quick Test

After making changes:

1. Push to `main` branch
2. Go to Vercel → Deployments
3. Check the new deployment
4. Under "Domains" section, you should see:
   - ✅ `thejobbridge-inc.com` (Production)
   - ❌ NOT just `jobbridge-*.vercel.app` (Preview)

## Still Not Working?

If it's still deploying to preview domains:

1. **Contact Vercel Support** - They can check domain assignment on their end
2. **Check Project Settings** - Make sure project isn't paused or restricted
3. **Verify Domain Ownership** - Make sure you own the domain in Vercel account
4. **Check Team/Account Settings** - Domain might be restricted at account level

## Important Notes

- **Preview deployments** (`jobbridge-*.vercel.app`) are normal for PRs and non-main branches
- **Production deployments** should go to `thejobbridge-inc.com` when pushing to `main`
- If you see both domains listed, that's OK - but Production should be `thejobbridge-inc.com`

# Contentful Preview Platform Form - Exact Values

Use these exact values when creating your preview platform in Contentful:

## Form Fields

### 1. Preview platform name (required)
```
The JobBridge Blog
```

### 2. Description (optional)
```
Preview blog posts before publishing to see how they'll appear on the website
```

### 3. Content types
- ✅ Check the box for **"Blog page"** (or whatever your blog content type is named)

### 4. Preview URL for Blog page (required)
```
https://thejobbridge-inc.com/blog/{entry.fields.slug}?preview=true
```

**Alternative URLs (if needed):**

If your slug field has a different name:
```
https://thejobbridge-inc.com/blog/{entry.fields.urlSlug}?preview=true
```

If you want to include entry ID as a fallback:
```
https://thejobbridge-inc.com/blog/{entry.fields.slug}?id={entry.sys.id}&preview=true
```

If you're using multi-locale:
```
https://thejobbridge-inc.com/{locale}/blog/{entry.fields.slug[locale]}?preview=true
```

## Step-by-Step Instructions

1. **Preview platform name:** Enter `The JobBridge Blog`
2. **Description:** Enter `Preview blog posts before publishing to see how they'll appear on the website` (optional but helpful)
3. **Content types:** Check the box next to **"Blog page"**
4. **Preview URL for Blog page:** Enter:
   ```
   https://thejobbridge-inc.com/blog/{entry.fields.slug}?preview=true
   ```
5. Click **Save**

## Important Notes

- Replace `{entry.fields.slug}` with your actual slug field name if it's different
- The URL must use `https://` (not `http://`)
- Make sure your domain (`thejobbridge-inc.com`) is correct
- The `?preview=true` parameter tells your website to use Preview API

## Testing After Setup

1. Create a draft blog post in Contentful
2. Click the **Preview** button in the entry editor
3. It should open: `https://thejobbridge-inc.com/blog/your-post-slug?preview=true`
4. Your website should show the draft content (once preview API is implemented)

## Troubleshooting

**If preview doesn't work:**
- Check that your slug field name matches exactly (case-sensitive)
- Verify the domain is correct
- Make sure the blog post route on your website handles `?preview=true`
- Check browser console for errors

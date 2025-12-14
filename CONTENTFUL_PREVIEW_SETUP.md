# Contentful Content Preview Setup

Content Preview allows editors to preview draft/unpublished blog posts in your website before they go live. This guide shows you how to set it up.

## What is Content Preview?

- **Preview draft content** before publishing
- **Live preview** - see changes as you type in Contentful
- **Preview in new tab** - open preview in a separate window
- Uses the **Content Preview API** (different from Delivery API)

## Step 1: Get Content Preview API Token

1. Go to Contentful → **Settings** → **API keys**
2. Find or create a **Content Preview API - access token**
3. Copy the token (you'll need this)

**Note:** This is different from the Content Delivery API token. Preview API can access both published AND draft content.

## Step 2: Configure Preview in Contentful

1. In Contentful, go to **Settings** → **Content preview**
2. Click **+ Create preview platform**
3. Fill in:
   - **Name:** `The JobBridge Blog`
   - **Description:** `Preview blog posts before publishing`
4. Under **Content preview URLs**, check the box for `blogPost` content type
5. In **Preview URL for content type blogPost**, enter:
   ```
   https://thejobbridge-inc.com/blog/{entry.fields.slug}?preview=true
   ```
   
   **Available Preview URL Tokens:**
   
   **Basic Tokens:**
   - `{env_id}` - The environment ID (e.g., "master", "development")
   - `{locale}` - The current locale code (e.g., "en-US")
   - `{entry.sys.id}` - The entry ID (UUID)
   
   **Entry Field Tokens:**
   - `{entry.fields.slug}` - The slug field value (default locale)
   - `{entry.fields.slug[LOCALE_CODE]}` - The slug for a specific locale (e.g., `{entry.fields.slug[es-ES]}`)
   - `{entry.fields.title}` - The title field value
   - `{entry.fields.anyFieldName}` - Any field from your content type
   
   **Reference Field Tokens:**
   - `{entry.fields.author.fields.name}` - Access fields from a reference (e.g., author name)
   - `{entry.fields.seo.fields.title}` - Nested reference fields
   
   **Linked Entry Tokens (Incoming Links):**
   - `{entry.linkedBy.sys.id}` - ID of the entry that references this entry
   - `{entry.linkedBy.fields.slug}` - Slug of the parent entry
   - `{entry.linkedBy.fields.title}` - Title of the parent entry
   
   **Example URLs:**
   ```
   # Simple slug-based URL (recommended for blog)
   https://thejobbridge-inc.com/blog/{entry.fields.slug}?preview=true
   
   # With entry ID as fallback
   https://thejobbridge-inc.com/blog/{entry.fields.slug}?id={entry.sys.id}&preview=true
   
   # Multi-locale support
   https://thejobbridge-inc.com/{locale}/blog/{entry.fields.slug[locale]}?preview=true
   
   # With environment ID
   https://thejobbridge-inc.com/blog/{entry.fields.slug}?env={env_id}&preview=true
   ```

6. Click **Save**

## Step 3: Add Preview API Support to Your Code

### Option A: Environment Variable (Recommended)

Add to Vercel environment variables:

```
CONTENTFUL_PREVIEW_TOKEN=your_preview_api_token_here
```

### Option B: Update Code to Support Preview

The code will automatically use Preview API when:
1. `CONTENTFUL_PREVIEW_TOKEN` is set
2. A `preview=true` query parameter is present in the request

## Step 4: Update Server Code (If Needed)

The current implementation uses Content Delivery API. To support preview:

1. **Check for preview parameter** in blog post routes
2. **Use Preview API client** when `preview=true` is detected
3. **Validate preview token** (optional, for security)

## Preview URL Format

When an editor clicks "Preview" in Contentful, it will open:
```
https://thejobbridge-inc.com/blog/your-post-slug?preview=true
```

**Token Resolution Example:**
If your blog post has:
- Slug: `"getting-started-with-accessibility"`
- Entry ID: `"4BqrajvA8E6qwgkieoqmqO"`
- Locale: `"en-US"`
- Environment: `"master"`

The preview URL will resolve to:
```
https://thejobbridge-inc.com/blog/getting-started-with-accessibility?preview=true
```

**Your blog post page should:**
- Detect the `preview=true` parameter
- Use Preview API instead of Delivery API
- Show draft/unpublished content
- Handle missing slugs gracefully (fallback to entry ID)

## Security Considerations

**Important:** Never include access tokens in preview URLs. Instead:

1. **Use environment variables** for tokens
2. **Validate preview requests** (optional - check if user is authenticated)
3. **Use preview tokens** only for preview endpoints
4. **Validate unsafe characters** in slug fields (spaces, #, %, etc.) to avoid broken links

**Token Safety:**
- Contentful automatically validates tokens before generating preview URLs
- Invalid tokens will result in broken preview links
- Always test your preview URLs after setting them up

## Testing Preview

1. Create a draft blog post in Contentful
2. Click **Preview** in Contentful
3. It should open your website showing the draft content
4. Publish the post to make it visible via Delivery API

## Current Implementation Status

Your current setup:
- ✅ Uses Content Delivery API (published content only)
- ❌ Preview API not yet implemented
- ❌ Preview parameter handling not implemented

## Next Steps

If you want to implement preview support:

1. Add `CONTENTFUL_PREVIEW_TOKEN` to Vercel
2. Update `server/contentful.ts` to support Preview API
3. Update blog post routes to check for `preview=true`
4. Test with draft content in Contentful

## References

- [Contentful Preview Documentation](https://www.contentful.com/developers/docs/tutorials/preview/content-preview/)
- [Content Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/)

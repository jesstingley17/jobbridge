# Contentful Content Type Field Mapping

When creating your `blogPost` content type in Contentful, use these field types:

## Required Fields

### 1. **title** → **Text** (Short text)
- Field ID: `title`
- Required: ✅ Yes
- Help text: "The title of the blog post"

### 2. **slug** → **Text** (Short text)
- Field ID: `slug`
- Required: ✅ Yes
- Help text: "URL-friendly identifier (e.g., 'my-blog-post')"
- Validation: Unique values ✅

### 3. **content** → **Rich text** (Recommended) OR **Text** (Long text)
- Field ID: `content`
- Required: ✅ Yes
- Help text: "The main blog post content"
- **Recommendation:** Use **Rich text** if you want formatting, links, and embedded media. Use **Text** (Long text) if you prefer plain text/markdown.

## Optional Fields

### 4. **excerpt** → **Text** (Short text)
- Field ID: `excerpt`
- Required: ❌ No
- Help text: "Brief description/summary of the post"

### 5. **featuredImage** → **Media**
- Field ID: `featuredImage`
- Required: ❌ No
- Help text: "Main image for the blog post"
- Allowed media types: Images only (or Images + Videos if you want)

### 6. **tags** → **Text** (Short text) - **Multiple values**
- Field ID: `tags`
- Required: ❌ No
- Help text: "Tags for categorizing the post"
- **Important:** Enable "Multiple values" ✅
- This creates an array of strings

### 7. **authorName** → **Text** (Short text)
- Field ID: `authorName`
- Required: ❌ No
- Help text: "Name of the author"
- **Alternative:** If you want to create an Author content type and reference it, use **Reference** instead

### 8. **publishedDate** → **Date and time**
- Field ID: `publishedDate`
- Required: ❌ No
- Help text: "When the post was/will be published"
- Date format: Date and time

### 9. **published** → **Boolean**
- Field ID: `published`
- Required: ❌ No
- Help text: "Whether the post is published"
- Default value: `true` (optional)

---

## Quick Setup Checklist

1. ✅ Create content type named `blogPost`
2. ✅ Add `title` (Text, Short, Required)
3. ✅ Add `slug` (Text, Short, Required, Unique)
4. ✅ Add `content` (Rich text OR Text Long, Required)
5. ✅ Add `excerpt` (Text, Short, Optional)
6. ✅ Add `featuredImage` (Media, Images, Optional)
7. ✅ Add `tags` (Text, Short, Multiple values, Optional)
8. ✅ Add `authorName` (Text, Short, Optional)
9. ✅ Add `publishedDate` (Date and time, Optional)
10. ✅ Add `published` (Boolean, Optional, Default: true)

---

## Alternative: Author as Reference

If you want to create a separate `Author` content type:

1. Create `Author` content type with:
   - `name` (Text, Short, Required)
   - `email` (Text, Short, Optional)
   - `bio` (Text, Long, Optional)
   - `avatar` (Media, Images, Optional)

2. In `blogPost`, replace `authorName` with:
   - **author** → **Reference** (to `Author` content type)
   - Field ID: `author`
   - Required: ❌ No
   - Help text: "The author of this post"

**Note:** If you use References, you'll need to update the code in `server/contentful.ts` to handle the reference structure. The current code expects `authorName` as a string.

---

## Content Type ID

**Important:** Make sure your content type ID is exactly `blogPost` (case-sensitive). The code looks for this specific ID:

```typescript
content_type: 'blogPost'
```

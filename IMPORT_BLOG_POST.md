# Quick Blog Post Import Guide

## Option 1: Copy-Paste into Admin Panel (Easiest)

1. Go to `/admin/blog`
2. Click **"Create New Post"**
3. Fill in the form with these values:

### Form Fields:

**Title:**
```
Ace Your JobBridge Interview Prep with AI Practice Sessions
```

**Slug:**
```
ace-your-jobbridge-interview-prep-with-ai-practice-sessions
```

**Excerpt:**
```
AI Interview Coach and Mock Interview AI: How to Master InterviewPrep AI for Real-Time Feedback and Success
```

**Content:** (Copy from `BLOG_POST_IMPORT.md` starting at "## Content" section)

**Author Name:**
```
The JobBridge Team
```

**Featured Image URL:**
```
https://images.unsplash.com/photo-1565728744382-61accd4aa148?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb
```

**Featured Image Alt Text:**
```
Professional job interview setting with candidate and interviewer at a desk, representing AI-powered interview preparation
```

**Tags:**
```
interview-prep, ai, career-advice, job-searching, accessibility
```

**Published:** ✅ Checked

4. Click **"Create"**

## Option 2: Use API (For Developers)

You can also create it via API call if you prefer:

```bash
curl -X POST https://thejobbridge-inc.com/api/admin/blog/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ace Your JobBridge Interview Prep with AI Practice Sessions",
    "slug": "ace-your-jobbridge-interview-prep-with-ai-practice-sessions",
    "excerpt": "AI Interview Coach and Mock Interview AI: How to Master InterviewPrep AI for Real-Time Feedback and Success",
    "content": "...",
    "authorName": "The JobBridge Team",
    "featuredImage": "https://images.unsplash.com/photo-1565728744382-61accd4aa148?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb",
    "featuredImageAltText": "Professional job interview setting with candidate and interviewer at a desk, representing AI-powered interview preparation",
    "tags": ["interview-prep", "ai", "career-advice", "job-searching", "accessibility"],
    "published": true
  }'
```

## Full Content

The complete formatted content is in `BLOG_POST_IMPORT.md` - copy everything from the "## Content" section onwards.

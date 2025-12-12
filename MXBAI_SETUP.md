# Mixedbread AI (MXBAI) Setup Instructions

## Overview

Mixedbread AI provides embedding and vector search capabilities for semantic search, similarity matching, and AI-powered content discovery.

## Configuration

✅ **Already configured!** Your MXBAI credentials are stored in `.env.local`:

```bash
MXBAI_API_KEY=mxb_1vTQnaiwAZ65eA7NLLj3Ud3aM4aW
MXBAI_STORE_ID=8207df80-ff7e-4deb-a7e5-cfe29bcb2409
```

## Usage

### Server-Side Usage

Import the helper functions in your server code:

```typescript
import { createEmbedding, searchVectorStore, addDocumentsToStore } from './server/mxbai';

// Create embeddings for text
const embedding = await createEmbedding('Your text here');

// Search in vector store
const results = await searchVectorStore('search query', 10);

// Add documents to store
await addDocumentsToStore([
  {
    id: 'doc1',
    text: 'Document content',
    metadata: { category: 'jobs', source: 'jobboard' }
  }
]);
```

### API Routes Example

You can create API routes to expose MXBAI functionality:

```typescript
// In server/routes.ts
import { createEmbedding, searchVectorStore } from './mxbai';

app.post('/api/ai/embed', async (req, res) => {
  try {
    const { text } = req.body;
    const embedding = await createEmbedding(text);
    res.json({ embedding });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create embedding' });
  }
});

app.post('/api/ai/search', async (req, res) => {
  try {
    const { query, limit } = req.body;
    const results = await searchVectorStore(query, limit || 10);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search' });
  }
});
```

## Use Cases for JobBridge

1. **Job Matching**: Create embeddings for job descriptions and user profiles to find better matches
2. **Resume Search**: Enable semantic search through resumes and applications
3. **Content Discovery**: Find similar job postings or related content
4. **Skills Matching**: Match user skills to job requirements using semantic similarity

## Environment Variables

### For Local Development

Already set in `.env.local` (gitignored).

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `MXBAI_API_KEY` = `mxb_1vTQnaiwAZ65eA7NLLj3Ud3aM4aW`
   - `MXBAI_STORE_ID` = `8207df80-ff7e-4deb-a7e5-cfe29bcb2409`
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

### For Replit

1. Go to your Replit project
2. Click on the **Secrets** tab (lock icon)
3. Add:
   - `MXBAI_API_KEY` = `mxb_1vTQnaiwAZ65eA7NLLj3Ud3aM4aW`
   - `MXBAI_STORE_ID` = `8207df80-ff7e-4deb-a7e5-cfe29bcb2409`

## Security Best Practices

- ✅ **Never commit API keys to Git** - Already in `.gitignore`
- ✅ **Use environment variables** - Credentials stored securely
- ✅ **Rotate keys regularly** - Regenerate API keys periodically for security

## API Reference

For full API documentation, visit: https://docs.mixedbread.ai

## Troubleshooting

- **"MXBAI client not initialized"**: Check that `MXBAI_API_KEY` and `MXBAI_STORE_ID` are set in environment variables
- **API errors**: Verify your API key is valid and has the necessary permissions
- **Store not found**: Ensure the `MXBAI_STORE_ID` matches an existing store in your MXBAI account



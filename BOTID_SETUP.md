# BotID Setup Guide

## What is BotID?

BotID is Vercel's bot detection service that helps protect your site from automated bots, scrapers, and malicious traffic. It works automatically on Vercel deployments.

## Installation

✅ **Package installed**: `botid` has been added to your dependencies.

## How It Works

### Automatic on Vercel

When deployed to Vercel, BotID is **automatically enabled** for your site. Vercel adds BotID headers to all requests:
- `x-vercel-botid`: Indicates if the request is from a bot
- `x-vercel-botid-verified`: Confirms the bot detection is verified

### Server-Side Integration

I've added BotID middleware to your Express server that:
1. Reads BotID headers from Vercel
2. Provides fallback bot detection using user agent patterns
3. Adds `req.botid` object to all requests with bot detection info

## Usage in Your Code

### Check if Request is from Bot

```typescript
// In any route handler
app.get('/api/some-endpoint', (req: any, res) => {
  if (req.botid?.isBot && req.botid?.verified) {
    // This is a verified bot - handle accordingly
    return res.status(403).json({ error: 'Bot access denied' });
  }
  
  // Normal request handling
  res.json({ data: 'success' });
});
```

### Block Bots from Specific Routes

```typescript
import { blockBots } from './server/botid.js';

// Block bots from this endpoint
app.post('/api/sensitive-action', blockBots, (req, res) => {
  // Only humans can reach here
  res.json({ success: true });
});
```

## Client-Side Integration (Optional)

For client-side bot detection, you can use the BotID JavaScript SDK:

```html
<script src="https://botid.vercel.app/botid.js"></script>
<script>
  botid.verify().then(result => {
    if (result.isBot) {
      // Handle bot detection on client side
      console.log('Bot detected');
    }
  });
</script>
```

## Configuration

### Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Security**
3. BotID should be **automatically enabled** for all deployments

### Environment Variables

No environment variables needed! BotID works automatically on Vercel.

## Testing

### Test Bot Detection

1. **Deploy to Vercel** (BotID only works on Vercel deployments)
2. **Check request headers** in your server logs:
   ```typescript
   console.log('BotID:', req.botid);
   console.log('Headers:', req.headers['x-vercel-botid']);
   ```

### Simulate Bot Request

Use a tool like curl with a bot user agent:
```bash
curl -H "User-Agent: Googlebot/2.1" https://thejobbridge-inc.com/api/test
```

## Benefits

✅ **Automatic Protection**: Works out of the box on Vercel
✅ **No Configuration**: No API keys or setup required
✅ **Free**: Included with Vercel hosting
✅ **Accurate**: Uses advanced ML models to detect bots
✅ **Non-Blocking**: Doesn't interfere with legitimate traffic

## Current Implementation

The BotID middleware is now:
- ✅ Installed in `package.json`
- ✅ Integrated in `server/botid.ts`
- ✅ Added to Express middleware stack in `server/index.ts`
- ✅ Available on all requests via `req.botid`

## Next Steps

1. **Deploy to Vercel** - BotID will automatically activate
2. **Monitor bot traffic** - Check `req.botid` in your logs
3. **Optionally block bots** - Use `blockBots` middleware on sensitive routes

## Documentation

- [Vercel BotID Docs](https://vercel.com/docs/botid/get-started)
- [BotID API Reference](https://vercel.com/docs/botid/api-reference)

# Database Connection Timeout Troubleshooting

## Current Issue

Database connections are timing out with errors like:
- "Connection terminated due to connection timeout"
- "timeout exceeded when trying to connect"

## Root Cause

The Supabase database pooler can be slow to establish connections, especially in serverless environments like Vercel. The connection timeout was too short (2s), causing connections to fail before they could be established.

## Fixes Applied

1. **Increased connection timeout** from 2s to 10s
2. **Reduced pool size** to 1 (serverless functions are stateless)
3. **Reduced idle timeout** to 10s (faster cleanup)
4. **Added `allowExitOnIdle`** to prevent connection leaks
5. **Added connection error handlers** for better logging

## Current Configuration

```typescript
{
  max: 1,                    // Single connection for serverless
  idleTimeoutMillis: 10000,   // 10 seconds
  connectionTimeoutMillis: 10000, // 10 seconds (was 2s)
  statement_timeout: 8000,   // 8 seconds per query
  allowExitOnIdle: true,     // Allow pool to close when idle
  ssl: {
    rejectUnauthorized: false // Required for Supabase pooler
  }
}
```

## If Timeouts Persist

### Option 1: Use Direct Connection (Not Pooler)

If the pooler continues to timeout, try using Supabase's direct connection instead:

1. In Supabase Dashboard → Settings → Database
2. Get the **Direct connection** string (not pooler)
3. Update `DATABASE_URL` in Vercel with the direct connection string
4. Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Option 2: Check Supabase Status

1. Check [Supabase Status Page](https://status.supabase.com/)
2. Verify your project is not experiencing issues
3. Check your Supabase project dashboard for any warnings

### Option 3: Increase Timeout Further

If 10s is still not enough, you can increase `connectionTimeoutMillis` to 15s or 20s, but this will make failures slower.

### Option 4: Use Connection Pooling Service

Consider using a connection pooling service like:
- PgBouncer (if self-hosting)
- Supabase's transaction pooler (already using)
- External pooling service

## Monitoring

Check Vercel logs for:
- `[DB Pool] Client connected` - Successful connections
- `[DB Pool] Unexpected error on idle client` - Connection errors
- Connection timeout errors - Indicates timeout is still too short

## Best Practices for Serverless

1. **Single connection per function** - ✅ Done (max: 1)
2. **Short idle timeout** - ✅ Done (10s)
3. **Allow exit on idle** - ✅ Done
4. **Connection error handling** - ✅ Done
5. **Query timeouts** - ✅ Done (8s)

---

**Last Updated**: After fixing database connection timeouts
**Status**: Optimized for Vercel serverless

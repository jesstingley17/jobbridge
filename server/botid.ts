// BotID integration for bot detection
// BotID is automatically enabled on Vercel deployments
// This file provides optional server-side bot detection

/**
 * BotID middleware for Express
 * 
 * Note: On Vercel, BotID is automatically enabled via the platform.
 * This middleware provides additional server-side bot detection if needed.
 * 
 * For client-side integration, see: https://vercel.com/docs/botid/get-started
 */

export interface BotIDResult {
  isBot: boolean;
  verified: boolean;
  score?: number;
}

/**
 * Check if a request is from a bot using BotID
 * This reads the BotID header that Vercel automatically adds
 */
export function checkBotID(req: any): BotIDResult {
  // Vercel automatically adds BotID headers to requests
  // Check for the BotID verification header
  const botidHeader = req.headers['x-vercel-botid'] || req.headers['x-botid'];
  const botidVerified = req.headers['x-vercel-botid-verified'];
  
  // If BotID header exists and is verified, trust it
  if (botidVerified === 'true') {
    return {
      isBot: botidHeader === '1' || botidHeader === 'true',
      verified: true,
    };
  }
  
  // Fallback: Check user agent for common bot patterns
  const userAgent = req.headers['user-agent'] || '';
  const isBotUA = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegram|discord/i.test(userAgent);
  
  return {
    isBot: isBotUA,
    verified: false,
  };
}

/**
 * Express middleware to add bot detection to requests
 */
export function botIDMiddleware(req: any, res: any, next: any) {
  const botResult = checkBotID(req);
  req.botid = botResult;
  
  // Log bot detection for monitoring (only in production or when explicitly enabled)
  if (process.env.NODE_ENV === 'production' || process.env.LOG_BOTID === 'true') {
    if (botResult.isBot && botResult.verified) {
      console.log(`[BotID] Bot detected: ${req.method} ${req.path} - Verified: ${botResult.verified}`);
    }
  }
  
  next();
}

/**
 * Optional: Block bots from certain routes
 * Only blocks verified bots to avoid false positives
 */
export function blockBots(req: any, res: any, next: any) {
  const botResult = checkBotID(req);
  
  // Only block if BotID has verified it's a bot (to avoid blocking legitimate traffic)
  if (botResult.isBot && botResult.verified) {
    console.log(`[BotID] Blocked bot request: ${req.method} ${req.path} from ${req.ip}`);
    return res.status(403).json({
      error: 'Bot access denied',
      message: 'This endpoint is not available for automated requests',
    });
  }
  
  // Allow through if not verified as bot (includes legitimate search engine bots)
  next();
}

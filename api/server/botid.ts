// BotID integration for bot detection using official botid package
// https://vercel.com/docs/botid/get-started

import { checkBotId } from 'botid/server';
import type { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to check for bots using official BotID
 * 
 * This uses the official checkBotId() function which reads BotID headers
 * that are automatically added by Vercel when the client-side protection
 * is configured.
 * 
 * Important: The protected route must be configured in the client-side
 * initBotId() call for checkBotId() to work properly.
 */
export async function blockBots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Use official BotID check with timeout to prevent hanging
    const verificationPromise = checkBotId({
      // Optional: Enable bot detection in development for testing
      ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_BOTID_DEV === 'true'
        ? { developmentOptions: { isDevelopment: true } }
        : {}),
    });

    // Add timeout to prevent BotID check from blocking requests too long
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('BotID check timeout')), 1000); // 1 second timeout
    });

    const verification = await Promise.race([verificationPromise, timeoutPromise]) as any;

    if (verification.isBot) {
      console.log(`[BotID] Blocked bot request: ${req.method} ${req.path} from ${req.ip}`);
      return res.status(403).json({
        error: 'Bot access denied',
        message: 'This endpoint is not available for automated requests',
      });
    }

    // Add bot verification info to request for logging
    (req as any).botid = {
      isBot: verification.isBot,
      verified: true,
    };

    next();
  } catch (error: any) {
    // If BotID check fails or times out, log but don't block (fail open)
    // This ensures legitimate users aren't blocked by slow BotID checks
    if (error.message === 'BotID check timeout') {
      console.warn('[BotID] Check timed out, allowing request through');
    } else {
      console.warn('[BotID] Error checking bot status:', error.message);
    }
    (req as any).botid = {
      isBot: false,
      verified: false,
      error: error.message,
    };
    next();
  }
}

/**
 * Express middleware to log bot detection without blocking
 * Useful for monitoring bot activity
 */
export async function logBots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const config: Parameters<typeof checkBotId>[0] = {};
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_BOTID_DEV === 'true') {
      config.developmentOptions = { isDevelopment: true };
    }
    const verification = await checkBotId(config);

    (req as any).botid = {
      isBot: verification.isBot,
      verified: true,
    };

    // Log bot detection for monitoring
    if (verification.isBot && (process.env.NODE_ENV === 'production' || process.env.LOG_BOTID === 'true')) {
      console.log(`[BotID] Bot detected: ${req.method} ${req.path} - IP: ${req.ip}`);
    }

    next();
  } catch (error: any) {
    console.warn('[BotID] Error checking bot status:', error.message);
    (req as any).botid = {
      isBot: false,
      verified: false,
      error: error.message,
    };
    next();
  }
}

import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify Clerk authentication token
 * Use this to protect your Express API routes
 * 
 * Usage:
 * app.get('/api/protected', verifyClerkAuth, (req, res) => {
 *   const user = req.clerkUser;
 *   res.json({ message: `Hello ${user.firstName}!` });
 * });
 */
export async function verifyClerkAuth(
  req: Request & { clerkUser?: any; clerkSession?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token with Clerk
    const decoded = await clerkClient.verifyToken(token);
    
    // Get user information from the decoded token
    const userId = decoded.sub;
    if (!userId) {
      throw new Error('Invalid token: no user ID found');
    }
    
    const user = await clerkClient.users.getUser(userId);

    // Attach user and decoded token to request object
    req.clerkUser = user;
    req.clerkSession = decoded;

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

/**
 * Optional: Check if user has a specific role
 */
export function requireClerkRole(role: string) {
  return async (
    req: Request & { clerkUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      await verifyClerkAuth(req as any, res, () => {});

      const user = req.clerkUser;
      const userRoles = user.publicMetadata?.roles || [];

      if (!userRoles.includes(role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          requiredRole: role 
        });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication required' });
    }
  };
}

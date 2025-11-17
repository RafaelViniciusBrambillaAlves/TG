// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './asyncHandler';
import { Types } from 'mongoose';
import { usuarioRepository } from '../repositories/usuarioRepository';

declare global {
  namespace Express {
    interface Request {
      user?: any; // substitua por IUser se quiser importar o tipo real
    }
  }
}

interface JwtPayloadExtended extends jwt.JwtPayload {
  id?: string;
}

/**
 * protect - middleware to protect routes (requires valid JWT)
 * token: looks for Bearer token in Authorization header or token cookie
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1) Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) Fallback to cookie named "token"
  if (!token && (req as any).cookies && (req as any).cookies.token) {
    token = (req as any).cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, token missing' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET ?? 'secret';
    const decoded = jwt.verify(token, secret) as JwtPayloadExtended;

    if (!decoded || !decoded.id) {
      res.status(401).json({ message: 'Not authorized, invalid token payload' });
      return;
    }

    // Load user from DB (without password)
    const user = await usuarioRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    // Remove sensitive fields if present (e.g. password)
    if ((user as any).password) {
      try { (user as any).password = undefined; } catch { /* ignore */ }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('protect middleware error:', err);
    res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
});

/**
 * authorize - middleware factory to restrict by roles
 * usage: authorize('admin'), authorize('manager','admin')
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
};

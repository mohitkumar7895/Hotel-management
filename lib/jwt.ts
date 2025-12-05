import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret12345';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signJwt(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    try {
      if (!token || typeof token !== 'string') {
        reject(new Error('Token is required and must be a string'));
        return;
      }

      if (!JWT_SECRET) {
        console.error('[JWT] JWT_SECRET is not set!');
        reject(new Error('JWT_SECRET is not configured'));
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      if (!decoded || !decoded.userId) {
        reject(new Error('Invalid token payload'));
        return;
      }

      resolve(decoded);
    } catch (error: any) {
      // Log specific error types for debugging
      if (error.name === 'TokenExpiredError') {
        console.error('[JWT] Token expired at:', error.expiredAt ? new Date(error.expiredAt * 1000).toISOString() : 'unknown');
      } else if (error.name === 'JsonWebTokenError') {
        console.error('[JWT] Token invalid:', error.message);
      } else if (error.name === 'NotBeforeError') {
        console.error('[JWT] Token not active yet:', error.message);
      } else {
        console.error('[JWT] Verification error:', error.message || error);
      }
      reject(error);
    }
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

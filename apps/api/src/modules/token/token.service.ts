import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AccessTokenExpired } from '../../helpers/errors/access-token-expired.errors.js';
import { AccessTokenInvalid } from '../../helpers/errors/access-token-invalid.errors.js';

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; 
export const SESSION_MAX_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

const JWT_SECRET = env.JWT_SECRET
const JWT_ISSUER = env.JWT_ISSUER
const JWT_AUDIENCE = env.JWT_AUDIENCE

export interface userPayloadData {
  id: string;
  name: string;
  role: 'LAWYER' | 'SECRETARY' | 'ADMIN';
};

export function generateAccessToken(user: userPayloadData): string {
  return jwt.sign(
    {
      name: user.name,
      role: user.role
    }, 
    JWT_SECRET, 
    {
      algorithm: 'HS256',
      subject: user.id,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: '15m'
    }
  );
}

export function verifyAccessToken(token: string): {userId: string} {
  let decoded: string | jwt.JwtPayload

  try {
    decoded = jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }
    );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AccessTokenExpired();
    }
    throw new AccessTokenInvalid();
  }

  if (typeof decoded === "string" || !decoded.sub) {
    throw new AccessTokenInvalid();
  }

  return { userId: decoded.sub };
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

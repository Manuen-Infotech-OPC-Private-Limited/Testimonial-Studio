import mongoose from 'mongoose';
import { extractSessionToken, verifyJwt } from '../utils/auth.js';
import { RevokedToken } from '../models/RevokedToken.js';

export function requireDbConnection(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'MongoDB is not connected',
      message: 'Check MONGODB_URI in .env and ensure MongoDB Atlas network access and credentials are valid.',
    });
  }
  next();
}

export async function requireAuth(req, res, next) {
  const token = extractSessionToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  let decoded;
  try {
    decoded = verifyJwt(token);
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(500).json({ error: 'Server authentication configuration error.' });
  }

  if (!decoded || !decoded.sub) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  try {
    if (decoded.jti) {
      const revoked = await RevokedToken.exists({ jti: decoded.jti });
      if (revoked) {
        return res.status(401).json({ error: 'Session has been signed out. Please sign in again.' });
      }
    }
  } catch (err) {
    console.error('Session revocation check failed:', err);
    return res.status(500).json({ error: 'Failed to verify session state.' });
  }

  req.user = {
    id: decoded.sub,
    mobileNumber: decoded.mobileNumber,
  };
  req.authToken = decoded;
  next();
}


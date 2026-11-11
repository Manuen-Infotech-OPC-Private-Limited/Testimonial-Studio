import crypto from 'crypto';
import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { RevokedToken } from '../models/RevokedToken.js';
import { requireDbConnection, requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import {
  normalizeMobileNumber,
  isValidMobileNumber,
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  extractSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from '../utils/auth.js';

const router = express.Router();

const signupRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many account creation attempts. Please try again in a few minutes.',
});

const signinIpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Too many sign-in attempts from this network. Please wait a few minutes.',
});

const signinAccountRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => {
    const mobile = normalizeMobileNumber(req.body?.mobileNumber || '');
    return `${req.ip || 'unknown'}:${mobile || 'empty'}`;
  },
  message: 'Too many failed sign-in attempts for this mobile number. Please wait 15 minutes.',
});

// POST /api/auth/signout - Revoke active JWT session and clear HttpOnly cookie
router.post('/signout', async (req, res) => {
  try {
    const token = extractSessionToken(req);
    if (token && mongoose.connection.readyState === 1) {
      try {
        const decoded = verifyJwt(token);
        if (decoded?.jti) {
          const expiresAt = decoded.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await RevokedToken.updateOne(
            { jti: decoded.jti },
            { $setOnInsert: { jti: decoded.jti, expiresAt } },
            { upsert: true }
          );
        }
      } catch {
        // Ignore malformed tokens during signout; cookie is cleared below
      }
    }
  } finally {
    clearSessionCookie(req, res);
    res.json({ ok: true });
  }
});

router.use(requireDbConnection);

// POST /api/auth/signup - Register using mobile number & password
router.post('/signup', signupRateLimiter, async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const mobileNumber = normalizeMobileNumber(req.body?.mobileNumber || '');
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || name.length < 2 || name.length > 120) {
      return res
        .status(400)
        .json({ error: 'Please enter your full name (2 to 120 characters).' });
    }
    if (!isValidMobileNumber(mobileNumber)) {
      return res.status(400).json({ error: 'Please enter a valid 10 to 15 digit mobile number.' });
    }
    if (password.length < 6 || password.length > 128) {
      return res
        .status(400)
        .json({ error: 'Password must be between 6 and 128 characters long.' });
    }

    const existing = await User.findOne({ mobileNumber }).lean();
    if (existing) {
      return res.status(409).json({
        error: 'An account with this mobile number already exists. Please sign in instead.',
      });
    }

    const now = new Date().toISOString();
    const user = await User.create({
      id: `user-${crypto.randomUUID()}`,
      name,
      mobileNumber,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
    });

    const token = signJwt({ sub: user.id, mobileNumber: user.mobileNumber });
    setSessionCookie(req, res, token);
    res.status(201).json({
      user: user.toJSON(),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        error: 'An account with this mobile number already exists. Please sign in instead.',
      });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/signin - Sign in using mobile number & password
router.post('/signin', signinIpRateLimiter, signinAccountRateLimiter, async (req, res) => {
  try {
    const mobileNumber = normalizeMobileNumber(req.body?.mobileNumber || '');
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidMobileNumber(mobileNumber) || !password || password.length > 128) {
      return res.status(400).json({ error: 'Please enter your mobile number and password.' });
    }

    const user = await User.findOne({ mobileNumber });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid mobile number or password.' });
    }

    const token = signJwt({ sub: user.id, mobileNumber: user.mobileNumber });
    setSessionCookie(req, res, token);
    res.json({
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

// GET /api/auth/session - Quietly check active session without emitting 401 noise on login page
router.get('/session', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ authenticated: false, user: null });
    }
    const token = extractSessionToken(req);
    if (!token) {
      return res.json({ authenticated: false, user: null });
    }
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.sub) {
      return res.json({ authenticated: false, user: null });
    }
    if (decoded.jti) {
      const revoked = await RevokedToken.exists({ jti: decoded.jti });
      if (revoked) {
        return res.json({ authenticated: false, user: null });
      }
    }
    const user = await User.findOne({ id: decoded.sub });
    if (!user) {
      return res.json({ authenticated: false, user: null });
    }
    res.json({ authenticated: true, user: user.toJSON() });
  } catch (err) {
    console.error('Session check error:', err);
    res.json({ authenticated: false, user: null });
  }
});

// GET /api/auth/me - Validate token and return signed-in user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    }
    res.json({ user: user.toJSON() });
  } catch (err) {
    console.error('Profile lookup error:', err);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

// POST /api/auth/downloads/increment - Increment export/download counter for signed-in user
router.post('/downloads/increment', requireAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.user.id },
      {
        $inc: { downloadCount: 1 },
        $set: { updatedAt: new Date().toISOString() },
      },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    }

    res.json({
      downloadCount: user.downloadCount || 0,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Download counter update error:', err);
    res.status(500).json({ error: 'Failed to record download.' });
  }
});

export default router;


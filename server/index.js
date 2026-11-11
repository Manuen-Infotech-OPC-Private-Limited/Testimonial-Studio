import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import designsRouter from './routes/designs.js';
import { Design } from './models/Design.js';
import { assertSecurityConfig, isSecureRequest } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

dotenv.config({ path: ENV_PATH });
assertSecurityConfig();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const DEV_LOCAL_ORIGIN_RE =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?$/i;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (configuredOrigins.includes(normalizedOrigin)) return callback(null, true);
      if (!isProduction && DEV_LOCAL_ORIGIN_RE.test(normalizedOrigin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const connectSources = [
  "'self'",
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  ...configuredOrigins,
].join(' ');
const cspHeader = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src ${connectSources}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', cspHeader);
  if (isSecureRequest(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

let lastDbError = null;
let isConnecting = false;

function hasPlaceholderPassword(uri) {
  return !uri || uri.includes('<db_password>') || uri.includes('<password>');
}

function normalizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/i);
  if (!schemeMatch) return rawUri;

  const [, scheme, rest] = schemeMatch;
  const slashIdx = rest.indexOf('/');
  const authority = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
  const tail = slashIdx === -1 ? '' : rest.slice(slashIdx);

  const lastAt = authority.lastIndexOf('@');
  if (lastAt === -1) return rawUri;

  const creds = authority.slice(0, lastAt);
  const host = authority.slice(lastAt + 1);
  const colonIdx = creds.indexOf(':');
  if (colonIdx === -1) return rawUri;

  const user = creds.slice(0, colonIdx);
  const rawPass = creds.slice(colonIdx + 1);

  if (/[@:/?#]/.test(rawPass) && !/%[0-9A-Fa-f]{2}/.test(rawPass)) {
    return `${scheme}${user}:${encodeURIComponent(rawPass)}@${host}${tail}`;
  }
  return rawUri;
}

async function connectMongoDB() {
  if (isConnecting || mongoose.connection.readyState === 1) {
    return;
  }

  // Re-read .env locally if present so updating credentials takes effect automatically on retry
  if (fs.existsSync(ENV_PATH)) {
    dotenv.config({ path: ENV_PATH, override: true });
  }
  const uri = process.env.MONGODB_URI?.trim();

  if (hasPlaceholderPassword(uri)) {
    lastDbError = 'Replace <db_password> in .env with your MongoDB Atlas password.';
    console.warn(`[MongoDB] Waiting for valid credentials: ${lastDbError}`);
    return;
  }

  isConnecting = true;
  try {
    await mongoose.connect(normalizeMongoUri(uri), {
      serverSelectionTimeoutMS: 8000,
    });
    // Ensure old global unique id index is replaced by compound { userId, id } index if present
    await Design.collection.dropIndex('id_1').catch(() => {});
    lastDbError = null;
    console.log('[MongoDB] Connected successfully to database:', mongoose.connection.name);
  } catch (err) {
    lastDbError = err instanceof Error ? err.message : 'Failed to connect to MongoDB';
    console.error('[MongoDB] Connection failed:', lastDbError);
  } finally {
    isConnecting = false;
  }
}

mongoose.connection.on('disconnected', () => {
  if (!lastDbError) {
    lastDbError = 'MongoDB disconnected';
  }
});

mongoose.connection.on('connected', () => {
  lastDbError = null;
});

// Public health check (sanitized: never exposes database name or raw error strings)
app.get('/api/health', async (_req, res) => {
  if (mongoose.connection.readyState === 0 && !isConnecting) {
    await connectMongoDB();
  }

  const readyState = mongoose.connection.readyState;

  res.json({
    ok: true,
    dbConnected: readyState === 1,
    status: readyState === 1 ? 'connected' : 'unavailable',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/designs', designsRouter);

// Serve built frontend in production / preview mode, or provide API root status when deployed backend-only
if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      service: 'testimonial-studio-api',
      ok: true,
      dbConnected: mongoose.connection.readyState === 1,
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API] Server listening on http://127.0.0.1:${PORT}`);
  connectMongoDB();
});

// Retry periodically if disconnected (e.g., before user pastes password in .env)
setInterval(() => {
  if (mongoose.connection.readyState === 0 && !isConnecting) {
    connectMongoDB();
  }
}, 10000);


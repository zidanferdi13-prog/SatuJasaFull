import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorMiddleware } from './shared/middleware/error.middleware';
import logger from './shared/logger';
import { globalLimiter } from './shared/middleware/rate-limit.middleware';
import { env } from './config/env';
import apiRouter from './routes';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────

const allowedOrigins = env.ALLOWED_ORIGINS
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const cspConnectSources = ["'self'", ...allowedOrigins];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: cspConnectSources,
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    logger.warn('Blocked CORS origin', { origin });
    callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────────────────

app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1', globalLimiter, apiRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorMiddleware);

export default app;

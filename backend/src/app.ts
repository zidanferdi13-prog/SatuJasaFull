import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorMiddleware } from './shared/middleware/error.middleware';
import { globalLimiter } from './shared/middleware/rate-limit.middleware';
import { env } from './config/env';
import apiRouter from './routes';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
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

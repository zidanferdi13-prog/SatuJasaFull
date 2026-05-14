import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorMiddleware } from './shared/middleware/error.middleware';
import apiRouter from './routes';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001').split(',');
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

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────

app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authLimiter, (req, res, next) => {
  // Apply rate limit only to auth routes
  next();
});
app.use('/api/v1', apiRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorMiddleware);

export default app;

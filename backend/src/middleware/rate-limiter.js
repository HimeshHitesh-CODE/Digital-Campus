import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 30, // Relaxed in development, secure in production
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sbtetSyncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isDev ? 500 : 20,
  message: {
    success: false,
    message: 'SBTET sync request rate exceeded. Please wait a few minutes before syncing again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDev ? 2000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
});

import rateLimit from 'express-rate-limit';
export const apiLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Please wait a moment.' } });
export const chatLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages. Please wait a moment.' } });

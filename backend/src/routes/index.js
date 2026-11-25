import { Router } from 'express';
import multer from 'multer';
import { config } from '../config/index.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { chat, getConfig, getModels, upload } from '../controllers/chat.js';
const bad = () => Object.assign(new Error('Unsupported file type. Use PDF, TXT, DOCX, CSV or an image.'), { status: 415 });
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxFileBytes, files: 1 },
  fileFilter: (_r, f, cb) => (/\.(pdf|txt|md|csv|docx)$/i.test(f.originalname) || /^image\/(png|jpeg|webp|gif)$/.test(f.mimetype) ? cb(null, true) : cb(bad())) });
const r = Router();
r.get('/config', getConfig);
r.get('/models', getModels);
r.post('/files', up.single('file'), upload);
r.post('/chat', chatLimiter, chat);
export default r;

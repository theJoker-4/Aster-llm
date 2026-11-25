import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT) || 8787,
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  defaultModel: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
  fallbackModels: (process.env.MODELS || 'gpt-4o-mini,gpt-4o').split(',').map((s) => s.trim()).filter(Boolean),
  webSearch: process.env.WEB_SEARCH === 'true',
  maxContextChars: 60000,
  maxFileBytes: 10 * 1024 * 1024,
  requestTimeoutMs: 120000,
};
export const hasKey = () => Boolean(process.env.OPENAI_API_KEY);

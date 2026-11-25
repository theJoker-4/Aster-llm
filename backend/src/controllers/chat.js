import { config, hasKey } from '../config/index.js';
import { getClient, toMessages, safeMessage, listModels } from '../services/openai.js';
import { processFile } from '../services/files.js';
import { validateChat } from '../utils/validate.js';

export const getConfig = (_q, res) => res.json({ configured: hasKey(), webSearch: false, defaultModel: config.defaultModel });
export const getModels = async (_q, res) => res.json({ models: hasKey() ? await listModels() : config.fallbackModels });

export async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    res.json(await processFile(req.file));
  } catch (e) { next(e); }
}

export async function chat(req, res) {
  const { error, data } = validateChat(req.body);
  if (error) return res.status(400).json({ error });
  if (!hasKey()) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured. Add it to backend/.env and restart the server.' });

  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
  res.flushHeaders();

  const ac = new AbortController();
  res.on('close', () => ac.abort());
  const timer = setTimeout(() => ac.abort(), config.requestTimeoutMs);
  const send = (o) => res.write(`data: ${JSON.stringify(o)}\n\n`);

  try {
    const instructions = `You are Aster, a helpful assistant. Use Markdown. ${data.instructions}`.trim();
    const stream = await getClient().chat.completions.create(
      { model: data.model || config.defaultModel, messages: toMessages(data.messages, instructions), stream: true },
      { signal: ac.signal }
    );
    for await (const chunk of stream) {
      const d = chunk.choices?.[0]?.delta?.content;
      if (d) send({ delta: d });
    }
    send({ done: true });
  } catch (e) {
    if (!res.writableEnded && !res.destroyed) send({ error: safeMessage(e) });
  } finally {
    clearTimeout(timer);
    res.end();
  }
}
import OpenAI from 'openai';
import { config } from '../config/index.js';
let client;
export const getClient = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL || undefined, timeout: 60000, maxRetries: 1 }));

export function trimHistory(messages) {
  const out = []; let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const size = m.content.length + m.attachments.reduce((n, a) => n + (a.text?.length || 0), 0);
    if (out.length && used + size > config.maxContextChars) break;
    used += size; out.unshift(m);
  }
  return out;
}

export function toMessages(messages, instructions) {
  const out = [{ role: 'system', content: instructions }];
  trimHistory(messages).forEach((m, i, arr) => {
    if (m.role === 'assistant') return out.push({ role: 'assistant', content: m.content });
    const text = [...m.attachments.filter((a) => a.kind === 'text' && a.text).map((a) => `[Attached file: ${a.name}]\n${a.text}`), m.content || '(see attachment)'].join('\n\n');
    const imgs = i === arr.length - 1 ? m.attachments.filter((a) => a.kind === 'image' && a.dataUrl) : [];
    out.push({ role: 'user', content: imgs.length ? [{ type: 'text', text }, ...imgs.map((a) => ({ type: 'image_url', image_url: { url: a.dataUrl } }))] : text });
  });
  return out;
}

export function safeMessage(e) {
  console.error('AI error:', e?.status, e?.message);
  if (/insufficient_quota|no credits|credit_balance/i.test(`${e?.code} ${e?.message}`)) return 'The AI account has no credits.';
  if (e?.status === 401) return 'The server API key was rejected. Check OPENAI_API_KEY.';
  if (e?.status === 429) return 'Rate limit reached. Wait a moment and try again.';
  if (e?.status === 404 || e?.status === 400) return 'The selected model is unavailable. Pick another model in Settings.';
  if (e?.name === 'AbortError' || /timed? ?out/i.test(e?.message || '')) return 'The request timed out.';
  return 'The AI service failed to respond. Please try again.';
}

let cache = { at: 0, list: null };
export async function listModels() {
  if (cache.list && Date.now() - cache.at < 600000) return cache.list;
  try {
    const page = await getClient().models.list();
    const custom = Boolean(process.env.OPENAI_BASE_URL);
    const ids = page.data.map((m) => m.id).filter((id) => custom ? !/(whisper|tts|guard|orpheus|playai)/.test(id) : (/^(gpt-|o\d|chatgpt-)/.test(id) && !/(audio|realtime|transcribe|tts|image|embedding|moderation|search|instruct|codex|preview|\d{4}-\d{2}-\d{2})/.test(id))).sort();
    if (ids.length) { cache = { at: Date.now(), list: ids }; return ids; }
  } catch { /* fall through */ }
  return config.fallbackModels;
}
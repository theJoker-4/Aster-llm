import mammoth from 'mammoth';
import pdf from 'pdf-parse/lib/pdf-parse.js';
const TEXT_MAX = 60000;
const IMG = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export async function processFile(f) {
  const name = f.originalname.slice(0, 120); const lower = name.toLowerCase();
  if (IMG.includes(f.mimetype)) return { name, kind: 'image', dataUrl: `data:${f.mimetype};base64,${f.buffer.toString('base64')}` };
  let text;
  if (lower.endsWith('.pdf')) text = (await pdf(f.buffer)).text;
  else if (lower.endsWith('.docx')) text = (await mammoth.extractRawText({ buffer: f.buffer })).value;
  else if (/\.(txt|md|csv)$/.test(lower)) text = f.buffer.toString('utf8');
  else { const e = new Error('Unsupported file type. Use PDF, TXT, DOCX, CSV or an image.'); e.status = 415; throw e; }
  text = text.trim();
  if (!text) { const e = new Error('No readable text found in this file.'); e.status = 422; throw e; }
  return { name, kind: 'text', text: text.slice(0, TEXT_MAX) };
}

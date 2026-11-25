const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const json = async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`); return j; };
export const getConfig = () => fetch(`${API}/api/config`).then(json);
export const getModels = () => fetch(`${API}/api/models`).then(json);
export const uploadFile = (file) => { const fd = new FormData(); fd.append('file', file); return fetch(`${API}/api/files`, { method: 'POST', body: fd }).then(json); };

export async function streamChat({ messages, model, instructions, webSearch, signal, onDelta }) {
  const body = JSON.stringify({ model, instructions, webSearch, messages: messages.map(({ role, content, attachments }) => ({ role, content, attachments: attachments || [] })) });
  let res;
  try { res = await fetch(`${API}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal }); }
  catch (e) { if (e.name === 'AbortError') throw e; throw new Error('Cannot reach the server. Check your connection and try again.'); }
  if (!res.ok) await json(res);
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (!line.startsWith('data: ')) continue;
        const ev = JSON.parse(line.slice(6));
        if (ev.error) throw new Error(ev.error);
        if (ev.delta) onDelta(ev.delta);
      }
    }
  } catch (e) { if (e.name === 'AbortError') throw e; if (e instanceof TypeError) throw new Error('Connection lost while generating.'); throw e; }
}

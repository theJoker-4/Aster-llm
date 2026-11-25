import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Globe, Loader2, Paperclip, Square, X, FileText } from 'lucide-react';
import { uploadFile } from '../services/api.js';

export default function Composer({ draft, setDraft, busy, onSend, onStop, disabled, webSearch, setWebSearch, canSearch }) {
  const ta = useRef(); const file = useRef();
  const [atts, setAtts] = useState([]); const [up, setUp] = useState(false); const [err, setErr] = useState('');
  useEffect(() => { const el = ta.current; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 200) + 'px'; }, [draft]);

  const attach = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setErr('File is too large (10 MB max).');
    if (atts.length >= 5) return setErr('You can attach up to 5 files.');
    setErr(''); setUp(true);
    try { const info = await uploadFile(f); setAtts((a) => [...a, info]); } catch (x) { setErr(x.message); } finally { setUp(false); }
  };
  const submit = () => { if (busy || disabled || up || (!draft.trim() && !atts.length)) return; onSend(draft.trim(), atts); setAtts([]); setDraft(''); };
  const key = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <div className="rounded-3xl border border-line bg-card p-3 shadow-lg shadow-black/10 focus-within:border-accent/60">
        {(atts.length > 0 || up) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {atts.map((a, i) => <span key={i} className="flex items-center gap-1.5 rounded-lg bg-ink/10 py-1 pl-2 pr-1 text-xs"><FileText size={13} />{a.name}<button aria-label={`Remove ${a.name}`} onClick={() => setAtts(atts.filter((_, j) => j !== i))} className="rounded p-0.5 hover:bg-ink/10"><X size={12} /></button></span>)}
            {up && <span className="flex items-center gap-1.5 text-xs text-muted"><Loader2 size={13} className="animate-spin" />Reading file…</span>}
          </div>
        )}
        <textarea ref={ta} rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={key} placeholder="Message Aster" aria-label="Message" className="max-h-52 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted" />
        <div className="mt-1 flex items-center gap-1">
          <input ref={file} type="file" hidden accept=".pdf,.txt,.md,.csv,.docx,image/png,image/jpeg,image/webp,image/gif" onChange={attach} />
          <button aria-label="Attach file" title="Attach file" onClick={() => file.current.click()} className="rounded-xl p-2 text-muted hover:bg-ink/10 hover:text-ink"><Paperclip size={18} /></button>
          {canSearch && <button aria-pressed={webSearch} onClick={() => setWebSearch(!webSearch)} className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm ${webSearch ? 'bg-accent2/15 text-accent2' : 'text-muted hover:bg-ink/10'}`}><Globe size={16} />Search</button>}
          <div className="flex-1" />
          {draft && <button aria-label="Clear input" title="Clear input" onClick={() => setDraft('')} className="rounded-xl p-2 text-muted hover:bg-ink/10 hover:text-ink"><X size={18} /></button>}
          {busy
            ? <button aria-label="Stop generating" title="Stop generating" onClick={onStop} className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-bg"><Square size={14} fill="currentColor" /></button>
            : <button aria-label="Send message" title="Send" onClick={submit} disabled={disabled || up || (!draft.trim() && !atts.length)} className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white transition-opacity disabled:opacity-30"><ArrowUp size={18} /></button>}
        </div>
      </div>
      {err && <p role="alert" className="mt-2 px-2 text-sm text-red-400">{err}</p>}
      <p className="mt-2 text-center text-xs text-muted">Enter to send, Shift+Enter for a new line. Aster can make mistakes.</p>
    </div>
  );
}

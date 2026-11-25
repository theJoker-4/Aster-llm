import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, FileText, Pencil, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import Markdown from './Markdown.jsx';

const Btn = ({ label, active, ...p }) => <button aria-label={label} title={label} className={`rounded-lg p-1.5 hover:bg-ink/10 ${active ? 'text-accent' : 'text-muted hover:text-ink'}`} {...p} />;

export default memo(function Message({ m, busy, isLast, onRegenerate, onEdit, onFeedback }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(m.content);
  const copy = async () => { await navigator.clipboard.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  if (m.role === 'user') return (
    <div className="group flex flex-col items-end gap-1">
      {m.attachments?.map((a, i) => <span key={i} className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1 text-xs text-muted"><FileText size={13} />{a.name}</span>)}
      {editing ? (
        <div className="w-full max-w-[85%] rounded-2xl border border-line bg-card p-3">
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="w-full resize-none bg-transparent text-[15px] outline-none" />
          <div className="mt-2 flex justify-end gap-2 text-sm">
            <button onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-muted hover:bg-ink/10">Cancel</button>
            <button disabled={!draft.trim() || busy} onClick={() => { setEditing(false); onEdit(m.id, draft.trim()); }} className="rounded-lg bg-accent px-3 py-1.5 font-medium text-white disabled:opacity-40">Save and regenerate</button>
          </div>
        </div>
      ) : (
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent/15 px-4 py-2.5 text-[15px] leading-relaxed">{m.content}</div>
      )}
      {!editing && !busy && <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><Btn label="Edit message" onClick={() => { setDraft(m.content); setEditing(true); }}><Pencil size={15} /></Btn></div>}
    </div>
  );

  const waiting = busy && isLast && !m.content && !m.error;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white"><Sparkles size={16} /></div>
      <div className="min-w-0 flex-1">
        {waiting ? (
          <div className="flex h-8 items-center gap-1.5" aria-label="Generating">
            {[0, 1, 2].map((i) => <motion.span key={i} className="h-2 w-2 rounded-full bg-muted" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />)}
          </div>
        ) : <Markdown text={m.content} />}
        {m.error && <p role="alert" className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{m.error}</p>}
        {!(busy && isLast) && (m.content || m.error) && (
          <div className="mt-2 -ml-1.5 flex gap-0.5">
            <Btn label="Copy response" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}</Btn>
            <Btn label="Regenerate response" onClick={() => onRegenerate(m.id)}><RefreshCw size={15} /></Btn>
            <Btn label="Good response" active={m.feedback === 'up'} onClick={() => onFeedback(m.id, m.feedback === 'up' ? null : 'up')}><ThumbsUp size={15} /></Btn>
            <Btn label="Bad response" active={m.feedback === 'down'} onClick={() => onFeedback(m.id, m.feedback === 'down' ? null : 'down')}><ThumbsDown size={15} /></Btn>
          </div>
        )}
      </div>
    </div>
  );
});

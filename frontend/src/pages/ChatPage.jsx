import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Code2, FileText, Lightbulb, PanelLeft, Download, BookOpen } from 'lucide-react';
import Message from '../components/Message.jsx';
import Composer from '../components/Composer.jsx';
import { streamChat } from '../services/api.js';
import { exportChat } from '../services/exporter.js';
import { uid } from '../hooks/useChats.js';
import { styleInstructions, useSettings } from '../context/SettingsContext.jsx';

const PROMPTS = [
  [BookOpen, 'Explain a complex topic', 'Explain how large language models work in simple terms.'],
  [Code2, 'Write Python code', 'Write a Python script that '],
  [FileText, 'Summarize a document', 'Summarize the attached document in five bullet points.'],
  [Lightbulb, 'Help me brainstorm ideas', 'Help me brainstorm ideas for '],
];

export default function ChatPage({ store, activeId, setActiveId, config, onToggleSidebar, sidebarOpen }) {
  const { settings } = useSettings();
  const chat = store.chats.find((c) => c.id === activeId);
  const [busy, setBusy] = useState(false); const [draft, setDraft] = useState(''); const [webSearch, setWebSearch] = useState(false); const [menu, setMenu] = useState(false);
  const abort = useRef(); const scroller = useRef(); const stick = useRef(true);
  const msgs = chat?.messages || [];

  useEffect(() => { if (stick.current) scroller.current?.scrollTo({ top: scroller.current.scrollHeight }); }, [msgs]);
  useEffect(() => { abort.current?.abort(); }, [activeId]);

  async function run(id, history) {
    const a = { id: uid(), role: 'assistant', content: '' };
    store.update(id, (c) => ({ ...c, messages: [...history, a], updatedAt: Date.now() }));
    const ac = new AbortController(); abort.current = ac; setBusy(true); stick.current = true;
    let buf = ''; let raf = 0;
    const patch = (p) => store.update(id, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === a.id ? { ...m, ...p } : m)) }));
    try {
      await streamChat({ messages: history, model: settings.model || config?.defaultModel, instructions: styleInstructions(settings), webSearch, signal: ac.signal,
        onDelta: (d) => { buf += d; if (!raf) raf = requestAnimationFrame(() => { raf = 0; patch({ content: buf }); }); } });
    } catch (e) { if (e.name !== 'AbortError') patch({ error: e.message }); }
    finally { cancelAnimationFrame(raf); patch({ content: buf }); setBusy(false); }
  }

  function send(text, attachments) {
    const id = activeId || store.create();
    if (!activeId) setActiveId(id);
    const history = [...msgs, { id: uid(), role: 'user', content: text, attachments }];
    if (!msgs.length) store.update(id, (c) => ({ ...c, title: (text || attachments[0]?.name || 'New chat').slice(0, 48) }));
    run(id, history);
  }
  const regenerate = (mid) => run(activeId, msgs.slice(0, msgs.findIndex((m) => m.id === mid)));
  const edit = (mid, text) => { const i = msgs.findIndex((m) => m.id === mid); run(activeId, [...msgs.slice(0, i), { ...msgs[i], content: text }]); };
  const feedback = (mid, v) => store.update(activeId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === mid ? { ...m, feedback: v } : m)) }));

  const missing = config && !config.configured;
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 px-3">
        {!sidebarOpen && <button aria-label="Open sidebar" onClick={onToggleSidebar} className="rounded-lg p-2 text-muted hover:bg-ink/10"><PanelLeft size={18} /></button>}
        <span className="truncate text-sm text-muted">{chat?.title}</span>
        <div className="flex-1" />
        {msgs.length > 0 && (
          <div className="relative">
            <button onClick={() => setMenu(!menu)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-ink/10"><Download size={15} />Export</button>
            {menu && <div className="absolute right-0 z-10 mt-1 w-32 rounded-xl border border-line bg-card p-1 shadow-lg">{[['txt', 'Text'], ['md', 'Markdown'], ['pdf', 'PDF']].map(([f, l]) => <button key={f} onClick={() => { exportChat(chat, f); setMenu(false); }} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-ink/10">{l}</button>)}</div>}
          </div>
        )}
      </header>

      {missing && <div role="alert" className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-500"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>The OpenAI API key is not configured. Add <code>OPENAI_API_KEY</code> to <code>backend/.env</code> and restart the backend.</span></div>}

      {msgs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4">
          <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How can I help you today?</h1>
          <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            {PROMPTS.map(([I, t, p]) => <button key={t} onClick={() => setDraft(p)} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left text-sm transition-colors hover:border-accent/60"><I size={18} className="shrink-0 text-accent2" />{t}</button>)}
          </div>
        </div>
      ) : (
        <div ref={scroller} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-7 px-4 py-6">
            {msgs.map((m, i) => <Message key={m.id} m={m} busy={busy} isLast={i === msgs.length - 1} onRegenerate={regenerate} onEdit={edit} onFeedback={feedback} />)}
          </div>
        </div>
      )}
      <div className="shrink-0 pt-2"><Composer draft={draft} setDraft={setDraft} busy={busy} onSend={send} onStop={() => abort.current?.abort()} disabled={missing} webSearch={webSearch} setWebSearch={setWebSearch} canSearch={config?.webSearch} /></div>
    </main>
  );
}

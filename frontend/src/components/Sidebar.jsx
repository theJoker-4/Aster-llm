import { useMemo, useState } from 'react';
import { PanelLeftClose, Pencil, Pin, PinOff, Plus, Search, Settings, Sparkles, Trash2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function Sidebar({ open, onClose, chats, activeId, onSelect, onNew, onRename, onDelete, onPin, onSettings }) {
  const [q, setQ] = useState(''); const { settings } = useSettings();
  const list = useMemo(() => chats.filter((c) => c.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.pinned - a.pinned || b.updatedAt - a.updatedAt), [chats, q]);
  const pick = (fn) => (...a) => { fn(...a); if (window.innerWidth < 768) onClose(); };
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-20 bg-black/50 md:hidden" />}
      <aside className={`fixed z-30 h-full shrink-0 overflow-hidden bg-side transition-[width] duration-200 md:static ${open ? 'w-72 border-r border-line' : 'w-0'}`}>
        <div className="flex h-full w-72 flex-col p-3">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white"><Sparkles size={16} /></div><span className="text-lg font-semibold">Aster</span></div>
            <button aria-label="Collapse sidebar" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-ink/10"><PanelLeftClose size={18} /></button>
          </div>
          <button onClick={pick(onNew)} className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-sm font-medium hover:border-accent/60"><Plus size={16} />New chat</button>
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-ink/5 px-3 py-2 text-sm"><Search size={15} className="text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" aria-label="Search chats" className="w-full bg-transparent outline-none placeholder:text-muted" /></label>
          <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto" aria-label="Chat history">
            {!list.length && <p className="px-3 py-6 text-center text-sm text-muted">{q ? 'No chats match your search.' : 'Your chats will appear here.'}</p>}
            {list.map((c) => (
              <div key={c.id} className={`group flex items-center rounded-xl ${c.id === activeId ? 'bg-ink/10' : 'hover:bg-ink/5'}`}>
                <button onClick={pick(() => onSelect(c.id))} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm">{c.pinned && <Pin size={12} className="shrink-0 text-accent" />}<span className="truncate">{c.title}</span></button>
                <div className="flex pr-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                  {[[c.pinned ? 'Unpin' : 'Pin', c.pinned ? PinOff : Pin, () => onPin(c.id)], ['Rename', Pencil, () => { const t = prompt('Rename chat', c.title)?.trim(); if (t) onRename(c.id, t); }], ['Delete', Trash2, () => confirm('Delete this chat?') && onDelete(c.id)]].map(([l, I, f]) => <button key={l} aria-label={`${l} chat`} title={l} onClick={f} className="rounded-md p-1.5 text-muted hover:bg-ink/10 hover:text-ink"><I size={14} /></button>)}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-2 flex items-center gap-3 border-t border-line pt-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent2/20 text-sm font-semibold text-accent2">{(settings.name || 'Y')[0].toUpperCase()}</div>
            <span className="flex-1 truncate text-sm">{settings.name}</span>
            <button aria-label="Settings" onClick={onSettings} className="rounded-lg p-2 text-muted hover:bg-ink/10 hover:text-ink"><Settings size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

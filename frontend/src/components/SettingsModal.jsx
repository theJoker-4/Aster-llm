import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getModels } from '../services/api.js';
import { useSettings } from '../context/SettingsContext.jsx';

const Row = ({ label, children }) => <div className="space-y-1.5"><div className="text-sm font-medium">{label}</div>{children}</div>;
const field = 'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60';

export default function SettingsModal({ onClose, chatCount, onClearAll }) {
  const { settings, set } = useSettings(); const [models, setModels] = useState([]);
  useEffect(() => { getModels().then((r) => setModels(r.models)).catch(() => {}); const k = (e) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label="Settings" className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border border-line bg-side p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Settings</h2><button aria-label="Close settings" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/10"><X size={18} /></button></div>
        <Row label="Theme"><div className="flex gap-2">{['dark', 'light'].map((t) => <button key={t} onClick={() => set({ theme: t })} className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize ${settings.theme === t ? 'border-accent bg-accent/15' : 'border-line'}`}>{t}</button>)}</div></Row>
        <Row label="Default model"><select value={settings.model} onChange={(e) => set({ model: e.target.value })} className={field}><option value="">Server default</option>{models.map((m) => <option key={m}>{m}</option>)}</select></Row>
        <Row label="Response style"><select value={settings.style} onChange={(e) => set({ style: e.target.value })} className={field}><option value="balanced">Balanced</option><option value="concise">Concise</option><option value="detailed">Detailed</option></select></Row>
        <Row label="Custom instructions"><textarea rows={3} maxLength={1000} value={settings.custom} onChange={(e) => set({ custom: e.target.value })} placeholder="Anything Aster should always keep in mind" className={field} /></Row>
        <Row label="Display name"><input value={settings.name} maxLength={30} onChange={(e) => set({ name: e.target.value })} className={field} /></Row>
        <Row label="Chat history"><div className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm"><span className="text-muted">{chatCount} saved in this browser</span><button disabled={!chatCount} onClick={() => confirm('Delete all conversations? This cannot be undone.') && onClearAll()} className="text-red-400 disabled:opacity-40">Clear all</button></div></Row>
      </div>
    </div>
  );
}

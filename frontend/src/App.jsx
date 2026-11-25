import { lazy, Suspense, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { useChats } from './hooks/useChats.js';
import { getConfig } from './services/api.js';
const SettingsModal = lazy(() => import('./components/SettingsModal.jsx'));

export default function App() {
  const store = useChats();
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(() => window.innerWidth >= 768);
  const [settings, setSettings] = useState(false);
  const [config, setConfig] = useState(null);
  useEffect(() => { getConfig().then(setConfig).catch(() => setConfig({ configured: false })); }, []);
  const del = (id) => { store.remove(id); if (id === activeId) setActiveId(null); };
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} chats={store.chats} activeId={activeId} onSelect={setActiveId} onNew={() => setActiveId(null)}
        onRename={(id, t) => store.update(id, (c) => ({ ...c, title: t }))} onDelete={del} onPin={(id) => store.update(id, (c) => ({ ...c, pinned: !c.pinned }))} onSettings={() => setSettings(true)} />
      <ChatPage store={store} activeId={activeId} setActiveId={setActiveId} config={config} sidebarOpen={open} onToggleSidebar={() => setOpen(true)} />
      {settings && <Suspense fallback={null}><SettingsModal onClose={() => setSettings(false)} chatCount={store.chats.length} onClearAll={() => { store.clear(); setActiveId(null); }} /></Suspense>}
    </div>
  );
}

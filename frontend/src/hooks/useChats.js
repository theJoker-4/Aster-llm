import { useCallback, useEffect, useState } from 'react';
const KEY = 'aster.chats.v1';
export const uid = () => crypto.randomUUID();
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export function useChats() {
  const [chats, setChats] = useState(load);
  useEffect(() => {
    try { // image data is not persisted to keep storage small
      localStorage.setItem(KEY, JSON.stringify(chats.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, attachments: m.attachments?.map(({ dataUrl, ...a }) => a) })) }))));
    } catch { /* storage full */ }
  }, [chats]);
  const create = useCallback(() => { const c = { id: uid(), title: 'New chat', pinned: false, updatedAt: Date.now(), messages: [] }; setChats((l) => [c, ...l]); return c.id; }, []);
  const update = useCallback((id, fn) => setChats((l) => l.map((c) => (c.id === id ? fn(c) : c))), []);
  const remove = useCallback((id) => setChats((l) => l.filter((c) => c.id !== id)), []);
  const clear = useCallback(() => setChats([]), []);
  return { chats, create, update, remove, clear };
}

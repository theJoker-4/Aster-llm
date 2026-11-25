import { createContext, useContext, useEffect, useState } from 'react';
const KEY = 'aster.settings.v1';
const DEFAULTS = { theme: 'dark', model: '', style: 'balanced', custom: '', name: 'You' };
const Ctx = createContext();
export const useSettings = () => useContext(Ctx);
export function SettingsProvider({ children }) {
  const [settings, setS] = useState(() => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return DEFAULTS; } });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(settings)); document.documentElement.dataset.theme = settings.theme; }, [settings]);
  const set = (patch) => setS((s) => ({ ...s, ...patch }));
  return <Ctx.Provider value={{ settings, set }}>{children}</Ctx.Provider>;
}
export const styleInstructions = (s) =>
  [{ concise: 'Keep answers brief and direct.', detailed: 'Give thorough, well-structured answers.', balanced: '' }[s.style], s.custom].filter(Boolean).join(' ');

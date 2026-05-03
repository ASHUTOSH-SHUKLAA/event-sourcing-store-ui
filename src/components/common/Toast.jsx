import { Lock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const fireToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 3500);
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ fireToast }}>
      {children}
      <div className="fixed bottom-10 right-10 z-[9999] flex flex-col gap-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="group flex min-w-[320px] items-center gap-4 overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-slate-900/80 p-1 pr-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[var(--accent-strong)] text-white shadow-lg transition-transform group-hover:scale-110">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1 py-3 text-sm font-bold tracking-tight text-white">
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

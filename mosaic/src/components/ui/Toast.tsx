import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';

type ToastType = 'success' | 'error' | 'info';
type ToastItem = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  open: boolean;
};

type ToastContextValue = {
  push: (type: ToastType, title: string, description?: string) => number;
  close: (id: number) => void;
  success: (title: string, description?: string) => number;
  error: (title: string, description?: string) => number;
  info: (title: string, description?: string) => number;
  promise: <T>(promise: Promise<T>, options: {
    loading: string | [string, string?];
    success: string | [string, string?];
    error: string | [string, string?];
  }) => Promise<T>;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const push = (type: ToastType, title: string, description?: string) => {
    const id = ++idRef.current;
    const item: ToastItem = { id, type, title, description, open: true };
    setToasts((prev) => [item, ...prev]);
    return id;
  };

  const close = (id: number) => remove(id);

  const norm = (v: string | [string, string?]): [string, string?] => Array.isArray(v) ? v : [v, undefined];

  async function promise<T>(p: Promise<T>, options: {
    loading: string | [string, string?];
    success: string | [string, string?];
    error: string | [string, string?];
  }): Promise<T> {
    const [lt, ld] = norm(options.loading);
    const [st, sd] = norm(options.success);
    const [et, ed] = norm(options.error);
    const id = push('info', lt, ld);
    try {
      const result = await p;
      close(id);
      push('success', st, sd);
      return result;
    } catch (err) {
      close(id);
      const msg = err instanceof Error ? err.message : ed;
      push('error', et, msg);
      throw err;
    }
  }

  const api = useMemo<ToastContextValue>(() => ({
    push,
    close,
    success: (t, d) => push('success', t, d),
    error: (t, d) => push('error', t, d),
    info: (t, d) => push('info', t, d),
    promise,
  }), []);

  return (
    <ToastContext.Provider value={api}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            duration={3000}
            open={t.open}
            onOpenChange={(open) => {
              if (!open) remove(t.id);
            }}
            className={`rounded-lg border shadow-lg p-3 bg-surface text-foreground flex items-start gap-3 ${
              t.type === 'success' ? 'border-green-600' : t.type === 'error' ? 'border-red-500' : 'border-border'
            }`}
          >
            <div className={`h-2 w-2 rounded-full mt-2 ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-500' : 'bg-foreground/50'}`} />
            <div className="flex-1">
              <RadixToast.Title className="body font-semibold">{t.title}</RadixToast.Title>
              {t.description && (
                <RadixToast.Description className="body-small text-muted">{t.description}</RadixToast.Description>
              )}
            </div>
            <RadixToast.Close aria-label="Close" className="btn-ghost px-2 py-1">×</RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed top-4 right-4 z-50 w-80 space-y-3 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

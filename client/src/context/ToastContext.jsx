import { createContext, useContext, useCallback, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const api = {
    success: (msg, duration) => push('success', msg, duration),
    error: (msg, duration) => push('error', msg, duration),
    info: (msg, duration) => push('info', msg, duration),
    warning: (msg, duration) => push('warning', msg, duration),
    remove
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
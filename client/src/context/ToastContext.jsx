import { createContext } from "react";
import { Toaster, toast } from "react-hot-toast";

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const show = (message, type = "success") => toast[type](message);
  const success = (msg) => show(msg, "success");
  const error = (msg) => show(msg, "error");
  const loading = (msg) => toast.loading(msg);

  return (
    <ToastContext.Provider value={{ success, error, loading, dismiss: toast.dismiss }}>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </ToastContext.Provider>
  );
};
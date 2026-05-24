// Modal
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", full: "max-w-4xl" };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`relative w-full ${widths[size] || widths.md} max-h-[85vh] bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};
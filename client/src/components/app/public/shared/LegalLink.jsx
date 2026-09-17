import { useState } from 'react';
import LegalModal from './LegalModal';

export default function LegalLink({ type, className = '', children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline text-left ${className}`}
      >
        {children}
      </button>

      <LegalModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
      />
    </>
  );
}
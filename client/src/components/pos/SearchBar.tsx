import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  barcodeBuffer: string;
  scanning: boolean;
}

export function SearchBar({ value, onChange, barcodeBuffer, scanning }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        placeholder="Search products or scan a barcode…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
        className="h-11"
      />
      {scanning ? (
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
          {barcodeBuffer}
        </span>
      ) : null}
    </div>
  );
}
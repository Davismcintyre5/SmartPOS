import { ReactNode, useEffect, useRef, useState } from 'react';
import { classNames } from '@/utils/classNames';

interface Item {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface Props {
  trigger: ReactNode;
  items: Item[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className={classNames('relative', className)}>
      <button onClick={() => setOpen((v) => !v)} type="button" className="block">
        {trigger}
      </button>
      {open && (
        <div
          className={classNames(
            'absolute z-40 mt-1 min-w-[180px] bg-white border border-slate-200 rounded-lg shadow-lg py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={classNames(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
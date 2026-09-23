import { forwardRef, SelectHTMLAttributes } from 'react';
import { classNames } from '@/utils/classNames';

interface Option {
  value: string | number;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { options, error, placeholder, className, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={classNames(
        'block w-full rounded-md border text-sm bg-white transition',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
        error ? 'border-red-400' : 'border-slate-300',
        'px-3 py-2',
        'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
});
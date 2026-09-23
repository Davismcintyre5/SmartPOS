import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/classNames';
import type { ReportParams } from '@/api/reports';

export type RangeValue =
  | { period: 'today' | 'week' | 'month' }
  | { from: string; to: string };

export interface DateRangePickerProps {
  value: RangeValue;
  onChange: (next: RangeValue) => void;
}

const PRESETS: Array<{ key: string; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function rangeToParams(value: RangeValue): ReportParams {
  if ('period' in value) return { period: value.period };
  return { from: value.from, to: value.to };
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [mode, setMode] = useState<string>(() => {
    if ('period' in value) return value.period;
    return 'custom';
  });

  const [from, setFrom] = useState<string>(
    'from' in value ? value.from : isoDaysAgo(29)
  );
  const [to, setTo] = useState<string>('to' in value ? value.to : todayIso());

  const pick = (key: string) => {
    setMode(key);
    if (key === 'today') onChange({ period: 'today' });
    else if (key === 'week') onChange({ period: 'week' });
    else if (key === 'month') onChange({ period: 'month' });
    else if (key === '30d') onChange({ from: isoDaysAgo(29), to: todayIso() });
    else onChange({ from, to });
  };

  const applyCustom = () => {
    if (!from || !to) return;
    onChange({ from, to });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {PRESETS.map((p) => {
          const active = mode === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => pick(p.key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {mode === 'custom' ? (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label
              htmlFor="range-from"
              className="mb-1 block text-xs text-muted-foreground"
            >
              From
            </label>
            <Input
              id="range-from"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <label
              htmlFor="range-to"
              className="mb-1 block text-xs text-muted-foreground"
            >
              To
            </label>
            <Input
              id="range-to"
              type="date"
              value={to}
              min={from}
              max={todayIso()}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <Button type="button" size="sm" onClick={applyCustom}>
            Apply
          </Button>
        </div>
      ) : null}
    </div>
  );
}
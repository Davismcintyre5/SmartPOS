import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/classNames';

export interface FaqItem {
  q: string;
  a: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'Do I need to install anything?',
    a: 'No. SmartPOS runs in your browser. Just sign in and start selling. A desktop app for offline use is coming soon.',
  },
  {
    q: 'How long is the free trial?',
    a: '14 days, no credit card required. You keep all your data if you decide to upgrade.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Cash, M-Pesa (STK Push, Send Money, Paybill, Till), card via Stripe, PayPal, and bank transfer.',
  },
  {
    q: 'Can I have multiple cashiers?',
    a: 'Yes. Each plan includes a number of cashier and manager seats. You can invite staff from the Users page.',
  },
  {
    q: 'What happens if I go over my transaction limit?',
    a: "We'll notify you as you approach the limit. You can upgrade at any time — no downtime, no data loss.",
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit, sessions use JWT with silent refresh, and every action is audit-logged.',
  },
  {
    q: 'Can I export my sales data?',
    a: 'Yes. Reports can be exported as CSV from the Reports page at any time.',
  },
  {
    q: 'How do I cancel?',
    a: 'You can cancel from Settings at any time. Your account stays active until the end of the billing period.',
  },
];

export interface FaqAccordionProps {
  items?: FaqItem[];
}

export function FaqAccordion({ items = DEFAULT_FAQS }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40"
              aria-expanded={open}
            >
              <span className="text-sm font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                  open && 'rotate-180'
                )}
              />
            </button>
            {open ? (
              <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
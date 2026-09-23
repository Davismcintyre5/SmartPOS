import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const BULLETS = [
  'Works offline on desktop',
  'Barcode scanning & inventory',
  'M-Pesa, Stripe, PayPal',
  'Receipts & daily reports',
];

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-24">
      <div className="flex-1 space-y-6 text-center md:text-left">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Built for growing businesses
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          The POS that keeps your business moving
        </h1>

        <p className="mx-auto max-w-xl text-base text-muted-foreground md:mx-0">
          Sell faster, track every shilling, and manage stock — all from one clean
          interface your cashiers will actually enjoy using.
        </p>

        <ul className="mx-auto grid max-w-md gap-2 text-sm text-muted-foreground md:mx-0">
          {BULLETS.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
          <Link to="/pricing">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start free trial
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid w-full max-w-md grid-cols-3 gap-2 p-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-border bg-muted/40"
                />
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-background/90 p-3 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">KES 2,450.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
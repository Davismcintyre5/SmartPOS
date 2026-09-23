import {
  ShoppingCart,
  Boxes,
  BarChart3,
  Smartphone,
  Users,
  Shield,
  Sparkles,
  Receipt,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Fast checkout',
    description: 'Barcode scanning, keyboard shortcuts, split payments — sell in seconds.',
  },
  {
    icon: Boxes,
    title: 'Inventory tracking',
    description: 'Real-time stock levels, low-stock alerts, and purchase orders.',
  },
  {
    icon: Receipt,
    title: 'Receipts & invoices',
    description: 'Print, email, or share thermal receipts and PDF invoices.',
  },
  {
    icon: Smartphone,
    title: 'M-Pesa & mobile money',
    description: 'STK Push, Send Money, Paybill, and Till — all built in.',
  },
  {
    icon: BarChart3,
    title: 'Reports & insights',
    description: 'Daily sales, top products, staff performance, and AI-powered insights.',
  },
  {
    icon: Users,
    title: 'Multi-user & roles',
    description: 'Owners, managers, and cashiers with granular permissions.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'JWT sessions, audit trails, and encrypted sensitive data.',
  },
  {
    icon: Sparkles,
    title: 'AI assistant',
    description: 'Ask questions about your business and get instant answers.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to run your store
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            One platform for sales, stock, payments, and reporting — no juggling tools.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
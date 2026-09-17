import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Wifi,
  ShieldCheck
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Fast checkout',
    description: 'Ring up sales in seconds with barcode scanning and quick-pick product tiles.'
  },
  {
    icon: Package,
    title: 'Inventory tracking',
    description: 'Real-time stock levels, low-stock alerts, and full movement history.'
  },
  {
    icon: Users,
    title: 'Customer records',
    description: 'Track purchases, loyalty points, and contact info for every customer.'
  },
  {
    icon: BarChart3,
    title: 'Reports & insights',
    description: 'Daily sales, top products, tax summaries, and cashier performance.'
  },
  {
    icon: Wifi,
    title: 'Works offline',
    description: 'Keep selling when the internet drops. Syncs automatically when back online.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description: 'Role-based access, encrypted data, and audit logs for every action.'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 md:px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Everything your shop needs
          </h2>
          <p className="text-[var(--text-secondary)] mt-3">
            Built for retail — from a single register to multi-location chains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6"
              >
                <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
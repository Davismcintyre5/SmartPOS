import { Link } from 'react-router-dom';
import { ArrowRight, Store, ShoppingCart, BarChart3 } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import Features from '../../components/app/public/Features';
import PlanCard from '../../components/app/public/PlanCard';
import DownloadsSection from '../../components/app/public/DownloadsSection';
import Button from '../../components/ui/Button';

export default function Landing() {
  const { site } = useSite();
  const plans = site?.plans || [];
  const name = site?.branding?.platformName || 'SmartPOS';
  const trialDays = site?.onboarding?.trialDays ?? 14;
  const currency = site?.currencies?.defaultSubscription || 'USD';

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full mb-4">
              Point of sale, reimagined
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
              Sell faster. <br />
              Grow smarter.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mt-6 max-w-xl leading-relaxed">
              {name} gives your shop everything it needs — barcode scanning, inventory,
              receipts, and reports. Works offline, syncs everywhere.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register">
                <Button size="lg">
                  Start free trial <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="secondary">See pricing</Button>
              </Link>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4">
              No credit card required · {trialDays}-day free trial
            </p>
          </div>

          <div className="relative">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Today's sales</span>
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">KES 42,850</div>
              <div className="text-xs text-[var(--success)] mb-6">+18% vs yesterday</div>

              <div className="space-y-3">
                {[
                  { icon: ShoppingCart, label: 'Transactions', value: '127' },
                  { icon: BarChart3, label: 'Avg. sale', value: 'KES 337' }
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Icon className="w-4 h-4" /> {row.label}
                      </span>
                      <span className="font-medium text-[var(--text-primary)]">{row.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Pricing preview */}
      {plans.length > 0 && (
        <section id="pricing" className="py-20 px-4 md:px-6 bg-[var(--bg-secondary)] scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Simple, honest pricing
              </h2>
              <p className="text-[var(--text-secondary)] mt-3">
                All features on every plan. Pick how you pay.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  currency={currency}
                  highlight={plan._id === 'pro'}
                  compact
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/pricing">
                <Button variant="secondary">
                  Compare all features <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Downloads — renders null if no downloads */}
      <DownloadsSection />

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Ready to get started?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mt-4">
            Set up your shop in minutes. No credit card, no commitment.
          </p>
          <Link to="/register" className="inline-block mt-8">
            <Button size="lg">
              Start free trial <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
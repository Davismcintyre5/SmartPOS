import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Search } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const CATEGORIES = ['Getting started', 'Billing & payments', 'Account & security', 'Store management', 'Integrations'];

const FAQS = [
  {
    category: 'Getting started',
    items: [
      { q: 'Do I need a credit card to start?', a: 'No. The free trial requires no card. You only pay when you upgrade to a paid plan.' },
      { q: 'How long does setup take?', a: 'About 5 minutes. You create an account, add products, and start selling.' },
      { q: 'Can I try before I buy?', a: 'Yes. Every account starts with a free trial that unlocks all features.' }
    ]
  },
  {
    category: 'Billing & payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'Stripe (card), PayPal, and M-Pesa (STK, Send Money, Paybill, Till).' },
      { q: 'Can I change plans later?', a: 'Yes. Upgrade or downgrade anytime from the Billing page.' },
      { q: 'What happens when my plan ends?', a: 'You enter a grace period. Renew to restore access. Your data stays safe.' }
    ]
  },
  {
    category: 'Account & security',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot password" on the login page. We email you a reset link.' },
      { q: 'Can I have multiple staff accounts?', a: 'Yes. Invite staff and assign roles from Settings.' }
    ]
  },
  {
    category: 'Store management',
    items: [
      { q: 'Can I use SmartPOS offline?', a: 'Yes. The desktop app keeps selling when the internet drops and syncs when back online.' },
      { q: 'How do I add products?', a: 'Go to Products → Add Product. You can also bulk import a CSV.' },
      { q: 'Do you support multiple currencies?', a: 'Yes. Stores can sell in 10 currencies. Subscriptions are available in KES, USD, EUR, and GBP.' }
    ]
  },
  {
    category: 'Integrations',
    items: [
      { q: 'Do you have an API?', a: 'API access is included with Enterprise plans.' },
      { q: 'Can I connect my own printer?', a: 'Yes. The desktop app supports ESC/POS thermal printers over USB.' }
    ]
  }
];

export default function FAQs() {
  const { site } = useSite();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const supportEmail = site?.branding?.supportEmail || 'support@smartpos.com';

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      query
        ? item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase())
        : true
    )
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">Frequently asked questions</h1>
        <p className="text-lg text-[var(--text-secondary)] mt-4">
          Quick answers to the most common questions.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-12 pr-4 py-3 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
      </div>

      <div className="space-y-10">
        {filtered.map((cat) => (
          <div key={cat.category}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{cat.category}</h2>
            <div className="space-y-2">
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = open === key;
                return (
                  <div
                    key={key}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--text-muted)]">No results for "{query}"</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Try the <Link to="/help" className="text-[var(--accent)] hover:underline">Help Center</Link> or email{' '}
              <a href={`mailto:${supportEmail}`} className="text-[var(--accent)] hover:underline">{supportEmail}</a>
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-[var(--text-secondary)] mb-4">Still have questions?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/help"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] text-sm font-medium transition-colors"
          >
            Visit Help Center <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] text-sm font-medium transition-colors"
          >
            Email support
          </a>
        </div>
      </div>
    </div>
  );
}
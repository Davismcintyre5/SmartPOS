import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const HELP_TOPICS = [
  {
    category: 'Getting started',
    topics: [
      { title: 'Create your account', summary: 'Sign up, activate your trial, and log in for the first time.' },
      { title: 'Set up your store', summary: 'Add your store name, currency, tax rate, and receipt details.' },
      { title: 'Make your first sale', summary: 'Scan or search for products, add to cart, and complete checkout.' }
    ]
  },
  {
    category: 'Selling',
    topics: [
      { title: 'Add products', summary: 'Create products manually or bulk import a CSV file.' },
      { title: 'Take payments', summary: 'Cash, card via Stripe, PayPal, or M-Pesa (STK, Send, Paybill, Till).' },
      { title: 'Issue receipts', summary: 'Print, email, or SMS a receipt after every sale.' }
    ]
  },
  {
    category: 'Inventory',
    topics: [
      { title: 'Track stock levels', summary: 'Stock updates automatically on every sale.' },
      { title: 'Adjust stock manually', summary: 'Record shrinkage, restocks, or corrections with a reason.' },
      { title: 'Low stock alerts', summary: 'Get notified when products drop below your threshold.' }
    ]
  },
  {
    category: 'Reports',
    topics: [
      { title: 'Daily sales', summary: 'See every sale, payment method, and total for a day.' },
      { title: 'Top products', summary: 'Find your best sellers over any period.' },
      { title: 'Tax summary', summary: 'Export VAT or sales tax totals for accounting.' }
    ]
  },
  {
    category: 'Account',
    topics: [
      { title: 'Manage staff', summary: 'Invite cashiers, managers, and other owners with role-based access.' },
      { title: 'Billing & plans', summary: 'Upgrade, downgrade, view payments, and manage your subscription.' },
      { title: 'Security', summary: 'Change password, enable 2FA, and review login activity.' }
    ]
  },
  {
    category: 'Troubleshooting',
    topics: [
      { title: 'Working offline', summary: 'Keep selling when the internet drops — sales sync automatically.' },
      { title: 'Sync issues', summary: 'Understand what happens when a register can\'t reach the server.' },
      { title: 'Printer setup', summary: 'Connect a USB thermal printer or a network receipt printer.' }
    ]
  }
];

export default function Help() {
  const { site } = useSite();
  const [query, setQuery] = useState('');

  const supportEmail = site?.branding?.supportEmail || 'support@smartpos.com';
  const supportPhone = site?.branding?.supportPhone;

  const filtered = HELP_TOPICS.map((cat) => ({
    ...cat,
    topics: cat.topics.filter((t) =>
      query
        ? t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.summary.toLowerCase().includes(query.toLowerCase())
        : true
    )
  })).filter((cat) => cat.topics.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-3 h-3" /> Help Center
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">How can we help?</h1>
        <p className="text-lg text-[var(--text-secondary)] mt-4">
          Guides, tips, and answers to get the most out of SmartPOS.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help topics..."
          className="w-full pl-12 pr-4 py-3 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
      </div>

      <div className="space-y-10">
        {filtered.map((cat) => (
          <div key={cat.category}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{cat.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cat.topics.map((topic) => (
                <button
                  key={topic.title}
                  className="text-left bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 hover:border-[var(--accent)] transition-colors"
                  onClick={() => alert(`Opening: ${topic.title}\n\n(Full guides coming soon.)`)}
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{topic.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{topic.summary}</p>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--text-muted)]">No results for "{query}"</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Try <Link to="/faqs" className="text-[var(--accent)] hover:underline">FAQs</Link> or email{' '}
              <a href={`mailto:${supportEmail}`} className="text-[var(--accent)] hover:underline">{supportEmail}</a>
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Still need help?</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Our support team is here for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] text-sm font-medium transition-colors"
          >
            Email {supportEmail} <ArrowRight className="w-4 h-4" />
          </a>
          {supportPhone && (
            <a
              href={`tel:${supportPhone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] text-sm font-medium transition-colors"
            >
              Call {supportPhone}
            </a>
          )}
          <Link
            to="/faqs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] text-sm font-medium transition-colors"
          >
            Browse FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import PlanCard from '../../components/app/public/PlanCard';

const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The 14-day free trial requires no card. You only pay when you upgrade to a paid plan.'
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or downgrade at any time from the Billing page.'
  },
  {
    q: 'What happens when my trial ends?',
    a: 'You can subscribe to Starter or Pro to keep using SmartPOS. Your data is kept safe.'
  },
  {
    q: 'Do you support multiple currencies?',
    a: 'Yes. Subscriptions are available in KES, USD, EUR, and GBP. Stores can sell in 10 currencies.'
  },
  {
    q: 'What is Enterprise?',
    a: 'Enterprise is a one-time purchase with perpetual access and API integration. Contact our sales team for pricing.'
  }
];

export default function Pricing() {
  const { site } = useSite();
  const plans = site?.plans || [];
  const systemCurrencies = site?.currencies?.system || ['KES', 'USD', 'EUR', 'GBP'];

  const [currency, setCurrency] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const activeCurrency =
    currency ||
    site?.currencies?.defaultSubscription ||
    systemCurrencies[0] ||
    'USD';

  return (
    <div className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">Pricing</h1>
          <p className="text-lg text-[var(--text-secondary)] mt-4">
            All features on every plan. Pick how you pay.
          </p>
        </div>

        {systemCurrencies.length > 1 && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-[var(--radius)] p-1">
              {systemCurrencies.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius)-2px)] transition-colors ${
                    activeCurrency === c
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              currency={activeCurrency}
              highlight={plan._id === 'pro'}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0 ml-4 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
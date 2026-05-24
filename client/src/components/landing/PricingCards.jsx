// PricingCards
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Check } from "lucide-react";
import { landingApi } from "../../api/landingApi";
import { formatPrice } from "../../utils/formatCurrency";

export const PricingCards = () => {
  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingApi.getPlans().then((res) => {
      if (res.success && res.plans) setPlansData(res.plans);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>;

  const currency = plansData?.currency || "KES";

  const plans = [
    { name: "Free Trial", price: formatPrice(0, currency), period: `${plansData?.freeTrialDays || 14} days`, features: ["Full access", "All features", "No credit card"], key: "trial" },
    { name: "Monthly", price: formatPrice(plansData?.monthly || plansData?.priceMonthly || 500, currency), period: "/month", features: ["Full access", "All features", "Priority support"], key: "monthly", highlighted: true },
    { name: "Yearly", price: formatPrice(plansData?.yearly || plansData?.priceYearly || 5000, currency), period: "/year", features: ["Full access", "All features", "API access", "Save 17%"], key: "yearly" },
    { name: "Permanent", price: formatPrice(plansData?.permanent || plansData?.pricePermanent || 12000, currency), period: "one-time", features: ["Full access", "All features", "Lifetime updates", "Pay once"], key: "permanent" },
  ];

  return (
    <section id="pricing" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Start free. Upgrade when you're ready.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative p-6 rounded-2xl border-2 flex flex-col transition-shadow hover:shadow-lg ${
              p.highlighted
                ? "border-primary-500 bg-primary-600 dark:bg-primary-600 shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            {p.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-white text-primary-600 text-xs font-bold px-4 py-1 rounded-full shadow">
                POPULAR
              </span>
            )}
            <h3 className={`text-lg font-semibold mb-1 ${p.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {p.name}
            </h3>
            <div className="mt-2 mb-5">
              <span className={`text-3xl font-bold ${p.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>{p.price}</span>
              <span className={`text-sm ml-1 ${p.highlighted ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>{p.period}</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {p.features.map((f) => (
                <li key={f} className={`flex items-center gap-2.5 text-sm ${p.highlighted ? "text-primary-50" : "text-gray-600 dark:text-gray-300"}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 ${p.highlighted ? "text-white" : "text-green-500"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to={`/register?plan=${p.key}`} className="mt-auto">
              <Button
                variant={p.highlighted ? "outline" : "outline"}
                className={`w-full ${p.highlighted ? "bg-white text-primary-600 hover:bg-gray-100 border-white" : ""}`}
              >
                {p.name === "Free Trial" ? "Start Free" : "Get Started"}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
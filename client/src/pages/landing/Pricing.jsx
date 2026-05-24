// Pricing
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../../components/landing/Navbar";
import { Footer } from "../../components/landing/Footer";
import { ChatWidget } from "../../components/landing/ChatWidget";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { landingApi } from "../../api/landingApi";
import { formatPrice } from "../../utils/formatCurrency";
import { Check, ArrowRight } from "lucide-react";

export const Pricing = () => {
  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingApi.getPlans().then((res) => {
      if (res.success && res.plans) setPlansData(res.plans);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const currency = plansData?.currency || "KES";

  const plans = [
    { name: "Free Trial", price: formatPrice(0, currency), period: `${plansData?.freeTrialDays || 14} days`, key: "trial", features: ["Full access to all features", "No credit card required", "Instant license key", "Email support"] },
    { name: "Monthly", price: formatPrice(plansData?.monthly || plansData?.priceMonthly || 500, currency), period: "/month", key: "monthly", popular: true, features: ["Full access to all features", "Unlimited products & sales", "M-Pesa, Stripe, PayPal", "Email & phone support", "Cloud backups"] },
    { name: "Yearly", price: formatPrice(plansData?.yearly || plansData?.priceYearly || 5000, currency), period: "/year", key: "yearly", features: ["Full access to all features", "Unlimited products & sales", "M-Pesa, Stripe, PayPal", "Priority support", "Cloud backups", "API access"] },
    { name: "Permanent", price: formatPrice(plansData?.permanent || plansData?.pricePermanent || 12000, currency), period: "one-time", key: "permanent", features: ["Full access to all features", "Unlimited products & sales", "M-Pesa, Stripe, PayPal", "Priority 24/7 support", "Cloud backups", "API access", "Lifetime updates"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="pt-24 pb-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Start with a {plansData?.freeTrialDays || 14}-day free trial. No credit card required. Upgrade when you're ready.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-6 rounded-2xl border-2 flex flex-col transition-shadow hover:shadow-lg ${
                p.popular
                  ? "border-primary-500 bg-primary-600 dark:bg-primary-600 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary-600 text-xs font-bold px-4 py-1 rounded-full shadow">
                  POPULAR
                </span>
              )}
              <h3 className={`text-lg font-semibold ${p.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {p.name}
              </h3>
              <div className="mt-3 mb-6">
                <span className={`text-4xl font-bold ${p.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {p.price}
                </span>
                <span className={`text-sm ml-1 ${p.popular ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {p.period}
                </span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${p.popular ? "text-primary-50" : "text-gray-600 dark:text-gray-300"}`}>
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.popular ? "text-white" : "text-green-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={`/register?plan=${p.key}`} className="mt-auto">
                <Button
                  className={`w-full ${p.popular ? "bg-white text-primary-600 hover:bg-gray-100 border-white" : ""}`}
                  variant={p.popular ? "outline" : "outline"}
                  size="lg"
                >
                  {p.name === "Free Trial" ? "Start Free" : "Get Started"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to Get Started?</h2>
        <p className="text-primary-100 text-lg mb-8">Join thousands of businesses. Start your free trial today.</p>
        <Link to="/register?plan=trial">
          <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};
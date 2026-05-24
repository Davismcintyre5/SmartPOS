// FeatureCards
import { ScanLine, Globe, Wifi, Brain, Users, ShieldCheck } from "lucide-react";

const features = [
  { icon: ScanLine, title: "Fast Barcode Scanning", desc: "Camera and external scanner support. Instant product detection." },
  { icon: Globe, title: "Multi-Currency", desc: "KES, USD, UGX, TZS and more. Auto-conversion when switching currencies." },
  { icon: Wifi, title: "Offline-First", desc: "Keep selling when the internet is down. Auto-syncs when back online." },
  { icon: Brain, title: "AI-Powered Insights", desc: "Sales analytics, inventory forecasts, and anomaly detection." },
  { icon: Users, title: "Staff Management", desc: "Cashier, manager, and admin roles with full permissions control." },
  { icon: ShieldCheck, title: "Data Isolation", desc: "Your business data is completely isolated and never shared." },
];

export const FeatureCards = () => {
  return (
    <section id="features" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Everything You Need</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <f.icon className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
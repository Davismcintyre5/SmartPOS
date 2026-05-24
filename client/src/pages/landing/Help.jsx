// Help
import { useEffect, useState } from "react";
import { Navbar } from "../../components/landing/Navbar";
import { Footer } from "../../components/landing/Footer";
import { ChatWidget } from "../../components/landing/ChatWidget";
import { Spinner } from "../../components/ui/Spinner";
import { landingApi } from "../../api/landingApi";
import { HelpCircle, Package, Users, BarChart3, Database, Zap } from "lucide-react";

const categories = [
  { icon: Zap, title: "Getting Started", desc: "Register, set up, start selling." },
  { icon: Package, title: "Products & Inventory", desc: "Add products, manage stock." },
  { icon: Users, title: "Staff Management", desc: "Add cashiers, set permissions." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Sales, inventory, AI insights." },
  { icon: Database, title: "Backups & Security", desc: "Manual and automatic backups." },
];

export const Help = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingApi.getSection("help").then((res) => {
      if (res.success) setContent(res.content);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Help Center</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Everything you need to know about SmartPOS.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {categories.map((c) => (
            <div key={c.title} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <c.icon className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.desc}</p>
            </div>
          ))}
        </div>
        {content?.body && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 max-w-3xl mx-auto">
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{content.body}</div>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
};
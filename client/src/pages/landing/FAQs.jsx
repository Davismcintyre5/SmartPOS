// FAQs
import { useEffect, useState } from "react";
import { Navbar } from "../../components/landing/Navbar";
import { Footer } from "../../components/landing/Footer";
import { FAQAccordion } from "../../components/landing/FAQAccordion";
import { ChatWidget } from "../../components/landing/ChatWidget";
import { Spinner } from "../../components/ui/Spinner";
import { landingApi } from "../../api/landingApi";

export const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingApi.getSection("faqs").then((res) => {
      if (res.success && res.content?.body) {
        const parsed = res.content.body.split("\n\n").filter(Boolean).map((block) => {
          const lines = block.split("\n");
          return { q: lines[0], a: lines.slice(1).join("\n") };
        });
        setFaqs(parsed);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h1>
        {faqs.length > 0 ? <FAQAccordion faqs={faqs} /> : <p className="text-center text-gray-500">No FAQs available yet.</p>}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
};
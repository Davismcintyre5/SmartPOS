// FAQAccordion
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FAQAccordion = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);
  if (!faqs.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
            <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          {openIndex === i && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">{faq.a}</div>}
        </div>
      ))}
    </div>
  );
};
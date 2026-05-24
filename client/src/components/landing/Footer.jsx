// Footer
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, Mail, Phone, MapPin } from "lucide-react";
import { LegalModal } from "../legal/LegalModal";
import { Modal } from "../ui/Modal";
import { ContactForm } from "./ContactForm";
import { landingApi } from "../../api/landingApi";

const legalLinks = [
  { key: "terms", label: "Terms" },
  { key: "privacy", label: "Privacy" },
  { key: "cookies", label: "Cookies" },
  { key: "refund", label: "Refund" },
  { key: "disclaimer", label: "Disclaimer" },
];

export const Footer = () => {
  const [activeLegal, setActiveLegal] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    landingApi.getSection("contact").then((res) => {
      if (res.success && res.content) setContactInfo(res.content);
    });
  }, []);

  const lines = contactInfo?.body?.split("\n").filter(Boolean) || [];

  const getIcon = (line) => {
    const lower = line.toLowerCase();
    if (lower.includes("email")) return <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />;
    if (lower.includes("phone")) return <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />;
    if (lower.includes("address")) return <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />;
    return null;
  };

  const cleanLine = (line) => {
    return line.replace(/^(email|phone|address):\s*/i, "");
  };

  return (
    <>
      <footer id="contact" className="bg-gray-900 text-gray-300 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6 text-primary-400" />
                <span className="text-lg font-bold text-white">SmartPOS</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fast, reliable point of sale built for supermarkets, wholesale, and retail shops across Africa.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-2.5">
                <Link to="/" className="block text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
                <Link to="/pricing" className="block text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/faqs" className="block text-sm text-gray-400 hover:text-white transition-colors">FAQs</Link>
                <Link to="/help" className="block text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
              <div className="space-y-2.5">
                {legalLinks.map((l) => (
                  <button key={l.key} onClick={() => setActiveLegal(l.key)} className="block text-sm text-gray-400 hover:text-white transition-colors text-left">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {contactInfo?.title || "Contact"}
              </h4>
              <div className="space-y-3 text-sm text-gray-400">
                {lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {getIcon(line)}
                    <span>{cleanLine(line)}</span>
                  </div>
                ))}
                <button
                  onClick={() => setShowContact(true)}
                  className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium mt-3"
                >
                  Send us a message
                  <span className="text-lg leading-none">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-5 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SmartPOS. All rights reserved.
          </div>
        </div>
      </footer>

      <LegalModal section={activeLegal} isOpen={!!activeLegal} onClose={() => setActiveLegal(null)} />
      <Modal isOpen={showContact} onClose={() => setShowContact(false)} title="Contact Us">
        <ContactForm onSuccess={() => setShowContact(false)} />
      </Modal>
    </>
  );
};
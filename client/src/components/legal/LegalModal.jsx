// LegalModal
import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { legalApi } from "../../api/legalApi";

const legalSections = {
  terms: "Terms and Conditions",
  privacy: "Privacy Policy",
  cookies: "Cookies Policy",
  refund: "Refund Policy",
  disclaimer: "Disclaimer",
};

export const LegalModal = ({ section, isOpen, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && section) {
      setLoading(true);
      setContent(null);
      legalApi.getSection(section).then((res) => {
        if (res.success && res.content) setContent(res.content);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, section]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={legalSections[section] || "Legal"} size="lg">
      {loading ? (
        <Spinner className="py-12" />
      ) : content ? (
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
          {content.body.split("\n").map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.match(/^\d+\./)) {
              return <h3 key={i} className="text-base font-semibold text-gray-900 dark:text-white pt-2">{line}</h3>;
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-12">Content not available.</p>
      )}
    </Modal>
  );
};
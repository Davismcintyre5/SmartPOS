// LandingHome
import { useEffect, useState } from "react";
import { Navbar } from "../../components/landing/Navbar";
import { Footer } from "../../components/landing/Footer";
import { Hero } from "../../components/landing/Hero";
import { FeatureCards } from "../../components/landing/FeatureCards";
import { FactsSection } from "../../components/landing/FactsSection";
import { PricingCards } from "../../components/landing/PricingCards";
import { DownloadSection } from "../../components/landing/DownloadSection";
import { ChatWidget } from "../../components/landing/ChatWidget";
import { Spinner } from "../../components/ui/Spinner";
import { landingApi } from "../../api/landingApi";

export const LandingHome = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingApi.getContent().then((res) => {
      if (res.success && res.content) {
        const map = {};
        res.content.forEach((c) => { map[c.section] = c; });
        setSections(map);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero title={sections.hero?.title} subtitle={sections.hero?.body} mediaUrl={sections.hero?.mediaUrl} />
      <FeatureCards />
      {sections.facts?.body && <FactsSection facts={sections.facts.body.split("\n").filter(Boolean)} />}
      <PricingCards />
      <DownloadSection />
      <Footer />
      <ChatWidget />
    </div>
  );
};
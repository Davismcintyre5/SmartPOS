// Hero
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { ArrowRight, Zap, Shield, Smartphone } from "lucide-react";

export const Hero = ({ title, subtitle, mediaUrl }) => {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem("smartpos_token");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLaunchApp = () => {
    if (hasToken) {
      navigate("/app/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleGetStarted = () => {
    if (hasToken) {
      navigate("/app/dashboard");
    } else {
      navigate("/pricing");
    }
  };

  return (
    <section id="hero" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full text-sm font-medium text-primary-700 dark:text-primary-400 mb-6">
          <Zap className="w-4 h-4" /> Lightning-Fast POS
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
          {title || "The Smartest POS for African Retail"}
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle || "Lightning-fast checkout, barcode scanning, M-Pesa integration, and multi-currency support."}
        </p>
        {mediaUrl && (
          <img src={mediaUrl} alt="SmartPOS Hero" className="mt-8 mx-auto max-w-full rounded-xl shadow-lg" />
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleGetStarted}>
            {hasToken ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={handleLaunchApp}>
            {hasToken ? "Launch App" : "Login"} <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Zap className="w-5 h-5 text-primary-500" />3-Second Checkout
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-5 h-5 text-primary-500" />Offline-First
          </div>
          <button onClick={() => scrollTo("downloads")} className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <Smartphone className="w-5 h-5" />Download SmartPOS App
          </button>
        </div>
      </div>
    </section>
  );
};
// Navbar
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store, Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const isHome = location.pathname === "/";

  const scrollTo = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleNav = (section) => {
    setOpen(false);
    setSupportOpen(false);
    if (isHome) {
      scrollTo(section);
    } else {
      navigate("/");
      setTimeout(() => scrollTo(section), 400);
    }
  };

  const handleLogoClick = () => {
    setOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center gap-2">
          <Store className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-bold text-primary-600">SmartPOS</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => handleNav("features")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</button>
          <button onClick={() => handleNav("pricing")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</button>
          <button onClick={() => handleNav("downloads")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Downloads</button>
          <div className="relative">
            <button onClick={() => setSupportOpen(!supportOpen)} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Support <ChevronDown className={`w-4 h-4 transition-transform ${supportOpen ? "rotate-180" : ""}`} />
            </button>
            {supportOpen && (
              <div className="absolute top-full mt-2 right-0 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                <Link to="/faqs" onClick={() => setSupportOpen(false)} className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">FAQs</Link>
                <Link to="/help" onClick={() => setSupportOpen(false)} className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Help Center</Link>
                <button onClick={() => handleNav("contact")} className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Contact</button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/pricing">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
          <button onClick={toggleDarkMode} className="flex items-center gap-2 text-sm text-gray-500">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Theme
          </button>
          <button onClick={() => handleNav("features")} className="block w-full text-left text-sm font-medium text-gray-600 dark:text-gray-400">Features</button>
          <button onClick={() => handleNav("pricing")} className="block w-full text-left text-sm font-medium text-gray-600 dark:text-gray-400">Pricing</button>
          <button onClick={() => handleNav("downloads")} className="block w-full text-left text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</button>
          <Link to="/faqs" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-400">FAQs</Link>
          <Link to="/help" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-400">Help Center</Link>
          <button onClick={() => handleNav("contact")} className="block w-full text-left text-sm font-medium text-gray-600 dark:text-gray-400">Contact</button>
          <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
            <Link to="/pricing" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
};
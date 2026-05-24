// Header
import { useState, useRef, useEffect } from "react";
import { Menu, Moon, Sun, LogOut, User, ChevronDown } from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getRoleColor = (role) => {
  switch (role) {
    case "owner": return "text-yellow-600 dark:text-yellow-400";
    case "admin": return "text-purple-600 dark:text-purple-400";
    case "manager": return "text-blue-600 dark:text-blue-400";
    case "cashier": return "text-green-600 dark:text-green-400";
    default: return "text-gray-600 dark:text-gray-400";
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "owner": return "Super Admin";
    case "admin": return "Admin";
    case "manager": return "Manager";
    case "cashier": return "Cashier";
    default: return "Staff";
  }
};

export const Header = () => {
  const { setMobileOpen } = useSidebar();
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getGreeting()}, <span className="font-semibold text-gray-900 dark:text-white">{user?.name?.split(" ")[0]}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Happy Selling — <span className={`font-medium ${getRoleColor(user?.role)}`}>{getRoleLabel(user?.role)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0) || "U"}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className={`text-xs font-medium mt-1 ${getRoleColor(user?.role)}`}>{getRoleLabel(user?.role)}</p>
              </div>
              <button onClick={() => { setProfileOpen(false); navigate("/app/settings"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <User className="w-4 h-4" /> Profile Settings
              </button>
              <button onClick={() => { setProfileOpen(false); logout(); navigate("/login"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
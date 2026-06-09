// components/layout/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, Users,
  BarChart3, Settings, X, ChevronLeft, Store, Pause
} from "lucide-react";

const allNavItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard", perm: null },
  { to: "/app/pos", icon: ShoppingCart, label: "POS", perm: "processSales" },
  { to: "/app/held-sales", icon: Pause, label: "Held Sales", perm: "processSales" },
  { to: "/app/products", icon: Package, label: "Products", perm: "manageProducts" },
  { to: "/app/sales", icon: Receipt, label: "Sales", perm: "processSales" },
  { to: "/app/customers", icon: Users, label: "Customers", perm: "manageCustomers" },
  { to: "/app/reports", icon: BarChart3, label: "Reports", perm: "viewReports" },
  { to: "/app/settings", icon: Settings, label: "Settings", perm: null },
];

export const Sidebar = () => {
  const { open, toggle, mobileOpen, setMobileOpen } = useSidebar();
  const { user, hasPermission } = useAuth();
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    import("../../api/aiApi").then(({ aiApi }) => {
      aiApi.getSettings().then((res) => {
        if (res.success) {
          const data = res.data || res;
          setAiEnabled(data.clientEnabled !== false);
        }
      }).catch(() => {});
    });
  }, []);

  const navItems = allNavItems.filter((item) => {
    if (item.perm === null) return true;
    if (user?.role === "owner") return true;
    return hasPermission(item.perm);
  });

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 overflow-hidden ${open ? "w-64" : "w-20"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="w-7 h-7 text-primary-600 shrink-0" />
            <span className={`font-bold text-gray-900 dark:text-white whitespace-nowrap transition-opacity ${open ? "opacity-100" : "opacity-0 w-0"}`}>SmartPOS</span>
          </div>
          <button onClick={toggle} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hidden lg:block">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!open ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"><X className="w-5 h-5" /></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`whitespace-nowrap transition-opacity ${open ? "opacity-100" : "opacity-0 w-0 hidden lg:inline"}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* HDM AI - Star Powered ✨ */}
        {aiEnabled && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-2">
            <NavLink
              to="/app/ai-chat"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 font-medium shadow-sm border border-blue-200 dark:border-blue-800"
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                }`
              }
            >
              <span className="text-xl shrink-0">🌟🤖</span>
              <span className={`whitespace-nowrap transition-opacity font-semibold ${open ? "opacity-100" : "opacity-0 w-0 hidden lg:inline"}`}>
                HDM AI
              </span>
            </NavLink>
          </div>
        )}

        {/* User */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className={`overflow-hidden transition-opacity ${open ? "opacity-100" : "opacity-0 w-0"}`}>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
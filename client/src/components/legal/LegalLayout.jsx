import { NavLink, Outlet } from "react-router-dom";

const legalPages = [
  { to: "/legal/terms", label: "Terms & Conditions" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/cookies", label: "Cookies Policy" },
  { to: "/legal/refund", label: "Refund Policy" },
  { to: "/legal/disclaimer", label: "Disclaimer" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/data-processing", label: "Data Processing" },
  { to: "/legal/sla", label: "SLA" },
  { to: "/legal/gdpr", label: "GDPR" },
  { to: "/legal/security", label: "Security" },
];

export const LegalLayout = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:sticky lg:top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legal Documents</h3>
              <div className="space-y-1">
                {legalPages.map((page) => (
                  <NavLink
                    key={page.to}
                    to={page.to}
                    className={({ isActive }) =>
                      `block px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    {page.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
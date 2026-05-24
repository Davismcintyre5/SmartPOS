// Layout
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSidebar } from "../../hooks/useSidebar";

export const Layout = () => {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`transition-all duration-300 ${open ? "lg:ml-64" : "lg:ml-20"}`}>
        <Header />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
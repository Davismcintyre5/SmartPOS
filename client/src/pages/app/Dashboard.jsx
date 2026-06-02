// pages/app/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { productApi } from "../../api/productApi";
import { useAuth } from "../../hooks/useAuth";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  TrendingUp, ShoppingCart, Package, Users, LayoutDashboard,
  Camera, CameraOff, ScanLine, DollarSign, ArrowRight,
  CheckCircle, Clock, AlertCircle, Zap, Store
} from "lucide-react";
import toast from "react-hot-toast";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [greeting, setGreeting] = useState("");

  const isOwner = user?.role === "owner";
  const isCashier = user?.role === "cashier";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const fetchAll = async () => {
    try {
      const params = {};
      if (isCashier) params.cashier = user.id;
      const [dashRes, prodRes] = await Promise.all([
        dashboardApi.getDashboard(params),
        productApi.getAll({ limit: 200 }),
      ]);
      if (dashRes.success) setData(dashRes.data || dashRes);
      if (prodRes.success) setProducts(prodRes.data?.products || prodRes.products || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleScan = useCallback(async (barcode) => {
    if (!hasPermission("processSales")) {
      toast.error("You don't have permission to process sales.");
      return;
    }
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      sessionStorage.setItem("quick_scan_product", JSON.stringify(product));
      setCameraOn(false);
      toast.success(`${product.name} — redirecting to POS...`);
      navigate("/app/pos");
    } else {
      toast.error("Product not found. Add it first.");
    }
  }, [hasPermission, navigate, products]);

  useBarcodeScanner({ onScan: handleScan, enabled: !loading && cameraOn, cameraEnabled: cameraOn });

  const stats = [
    { label: isCashier ? "My Revenue" : "Today's Revenue", value: formatCurrency(data?.todayRevenue || 0), icon: DollarSign, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", show: true },
    { label: isCashier ? "My Sales" : "Transactions", value: data?.todayTransactions || 0, icon: ShoppingCart, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-900/20", show: hasPermission("processSales") },
    { label: "Products", value: data?.totalProducts || 0, icon: Package, color: "from-purple-500 to-violet-600", bg: "bg-purple-50 dark:bg-purple-900/20", show: hasPermission("manageProducts") },
    { label: "Customers", value: data?.totalCustomers || 0, icon: Users, color: "from-orange-500 to-amber-600", bg: "bg-orange-50 dark:bg-orange-900/20", show: hasPermission("manageCustomers") },
  ];

  const quickActions = [
    { label: "New Sale", icon: ShoppingCart, color: "bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40", onClick: () => navigate("/app/pos"), show: hasPermission("processSales") },
    { label: "Add Product", icon: Package, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40", onClick: () => navigate("/app/products/new"), show: hasPermission("manageProducts") },
    { label: "Add Customer", icon: Users, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40", onClick: () => navigate("/app/customers/new"), show: hasPermission("manageCustomers") },
    { label: "Reports", icon: TrendingUp, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40", onClick: () => navigate("/app/reports"), show: hasPermission("viewReports") },
  ];

  // Dynamic setup steps based on actual data
  const steps = [
    { step: 1, text: "Set your currency", icon: DollarSign, done: true, show: isOwner, action: () => navigate("/app/settings") },
    { step: 2, text: "Add your first products", icon: Package, done: (data?.totalProducts || 0) > 0, show: hasPermission("manageProducts"), action: () => navigate("/app/products/new") },
    { step: 3, text: "Process your first sale", icon: ShoppingCart, done: (data?.todayTransactions || 0) > 0, show: hasPermission("processSales"), action: () => navigate("/app/pos") },
    { step: 4, text: "Add customer info", icon: Users, done: (data?.totalCustomers || 0) > 0, show: hasPermission("manageCustomers"), action: () => navigate("/app/customers/new") },
    { step: 5, text: "Review your reports", icon: TrendingUp, done: (data?.totalCustomers || 0) > 0 && (data?.todayTransactions || 0) > 0, show: hasPermission("viewReports"), action: () => navigate("/app/reports") },
  ].filter(s => s.show);

  const completedSteps = steps.filter(s => s.done).length;
  const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isCashier ? "Your personal sales overview" : "Here's what's happening with your business today."}
          </p>
        </div>
        {hasPermission("processSales") && (
          <button
            onClick={() => setCameraOn(!cameraOn)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
              cameraOn
                ? "bg-primary-50 border-primary-500 text-primary-600 shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300"
            }`}
          >
            {cameraOn ? <CameraOff className="w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
            {cameraOn ? "Stop Scanner" : "Quick Scan"}
          </button>
        )}
      </div>

      {/* Camera */}
      {cameraOn && (
        <div className="mb-6 rounded-xl overflow-hidden border-2 border-primary-300 dark:border-primary-700 shadow-lg">
          <video id="camera-preview" className="w-full h-48 object-cover bg-black" />
          <div className="bg-gray-900 text-white text-xs text-center py-2 flex items-center justify-center gap-2">
            <ScanLine className="w-4 h-4" />
            Scan a barcode to quickly start a sale in POS
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.filter(s => s.show).map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.filter(a => a.show).map((a) => (
                <button key={a.label} onClick={a.onClick} className={`p-4 rounded-xl transition-all text-center ${a.color}`}>
                  <a.icon className="w-7 h-7 mx-auto mb-2" />
                  <span className="text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Setup
            </h2>
            <span className="text-xs font-medium text-gray-500">{completedSteps}/{steps.length} done</span>
          </div>

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-5">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-1">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={s.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  s.done
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600"
                }`}>
                  {s.done ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{s.step}</span>}
                </div>
                <span className={`text-sm ${s.done ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300 group-hover:text-primary-600"}`}>
                  {s.text}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <Store className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-xs text-gray-500">Business</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.businessName || "SmartPOS"}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(new Date())}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
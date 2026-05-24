// Login
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authApi } from "../../api/authApi";
import { storage } from "../../utils/storage";
import { Store, ArrowLeft } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const savedEmail = storage.get("smartpos_remember") || "";

  const [form, setForm] = useState({ email: savedEmail, password: "", rememberMe: !!savedEmail });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      if (form.rememberMe) storage.set("smartpos_remember", form.email);
      else storage.remove("smartpos_remember");

      if (res.activated) {
        storage.set("smartpos_token", res.token);
        storage.set("smartpos_user", res.user);
        storage.set("smartpos_clientId", res.clientId);
        navigate("/app/dashboard");
      } else {
        storage.set("smartpos_pending_email", form.email);
        storage.set("smartpos_pending_clientId", res.clientId);
        navigate("/activate");
      }
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to your SmartPOS account</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
            </label>

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

            <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/pricing" className="text-primary-600 hover:underline font-medium">Get Started</Link>
        </p>
      </div>
    </div>
  );
};
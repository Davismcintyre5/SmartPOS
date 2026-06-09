// pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Store } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const savedEmail = localStorage.getItem("smartpos_remember") || "";

  const [form, setForm] = useState({ email: savedEmail, password: "", rememberMe: !!savedEmail });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (form.rememberMe) localStorage.setItem("smartpos_remember", form.email);
      else localStorage.removeItem("smartpos_remember");
      if (res.activated) navigate("/app/dashboard");
      else navigate("/activate");
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to your SmartPOS account</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="you@example.com" 
              required 
            />
            
            <div>
              <Input 
                label="Password" 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                placeholder="Enter your password" 
                required 
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.rememberMe} 
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} 
                className="w-4 h-4 rounded border-gray-300 text-primary-600" 
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/pricing" className="text-primary-600 hover:underline font-medium">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
};
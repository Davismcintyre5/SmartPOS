// Activation
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authApi } from "../../api/authApi";
import { storage } from "../../utils/storage";
import { Key, ArrowLeft } from "lucide-react";

export const Activation = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyLicense({ licenseKey });
      if (res.success && res.valid) {
        storage.remove("smartpos_pending_email");
        storage.remove("smartpos_pending_clientId");
        navigate("/login");
      } else {
        setError(res.message || "Invalid license key");
      }
    } catch {
      setError("Verification failed. Try again.");
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
            <Key className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activate Your Device</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter your license key to activate this device.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="License Key" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value.toUpperCase())} placeholder="SMART-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" className="font-mono text-center" required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">Activate</Button>
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
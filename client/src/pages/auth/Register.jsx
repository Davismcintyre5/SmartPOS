// Register
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LegalModal } from "../../components/legal/LegalModal";
import { authApi } from "../../api/authApi";
import { Store, Copy, Check, Shield, Key, ArrowRight, ArrowLeft } from "lucide-react";

export const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get("plan") || "trial";

  const [form, setForm] = useState({ businessName: "", ownerName: "", phone: "", email: "", password: "", agreed: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [legalSection, setLegalSection] = useState(null);

  useEffect(() => {
    const handler = (e) => setLegalSection(e.detail);
    window.addEventListener("open-legal", handler);
    return () => window.removeEventListener("open-legal", handler);
  }, []);

  const isFreeTrial = plan === "trial";
  const planNames = { trial: "Free Trial", monthly: "Monthly", yearly: "Yearly", permanent: "Permanent" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.agreed) return setError("You must agree to the Terms and Privacy Policy.");
    setLoading(true);
    try {
      if (isFreeTrial) {
        const res = await authApi.register({
          businessName: form.businessName, ownerName: form.ownerName, email: form.email,
          phone: form.phone, password: form.password, currency: "KES",
        });
        if (res.success && res.licenseKey) { setLicenseKey(res.licenseKey); setShowSuccess(true); }
        else setError(res.message || "Registration failed");
      } else {
        sessionStorage.setItem("smartpos_registration", JSON.stringify({
          businessName: form.businessName, ownerName: form.ownerName, email: form.email,
          phone: form.phone, password: form.password, plan,
        }));
        navigate(`/checkout?plan=${plan}`);
      }
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5"><Check className="w-8 h-8 text-green-600" /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your free trial is active. Save this key — you'll need it to activate your device.</p>
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-center gap-2 mb-3"><Key className="w-4 h-4 text-primary-600" /><span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">License Key</span></div>
            <p className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all select-all mb-3">{licenseKey}</p>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(licenseKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Key</>}</Button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6"><p className="text-xs text-red-600 dark:text-red-400 font-medium">⚠️ Save this key somewhere safe. You cannot recover it.</p></div>
          <Button className="w-full" size="lg" onClick={() => navigate("/login")}>Go to Login <ArrowRight className="w-5 h-5" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Store className="w-7 h-7 text-primary-600" /></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isFreeTrial ? "Start Your Free Trial" : `Subscribe to ${planNames[plan]}`}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{isFreeTrial ? "Get instant access. No credit card required." : "Fill in your details to continue to payment."}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {isFreeTrial && (
              <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-400"><Shield className="w-4 h-4 flex-shrink-0" />Your license key will be issued instantly upon registration.</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="My Shop Ltd" required />
              <Input label="Your Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="John Doe" required />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" required />
              <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required />

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.agreed} onChange={(e) => setForm({ ...form, agreed: e.target.checked })} className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">I agree to the{" "}<button type="button" onClick={() => setLegalSection("terms")} className="text-primary-600 hover:underline">Terms and Conditions</button>{" "}and{" "}<button type="button" onClick={() => setLegalSection("privacy")} className="text-primary-600 hover:underline">Privacy Policy</button></span>
              </label>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" loading={loading} className="w-full" size="lg">{isFreeTrial ? "Start Free Trial" : "Continue to Payment"}</Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Already have an account?{" "}<Link to="/login" className="text-primary-600 hover:underline font-medium">Login</Link></p>
        </div>
      </div>
      <LegalModal section={legalSection} isOpen={!!legalSection} onClose={() => setLegalSection(null)} />
    </div>
  );
};
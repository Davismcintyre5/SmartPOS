// Checkout
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { landingApi } from "../../api/landingApi";
import { authApi } from "../../api/authApi";
import { formatPrice } from "../../utils/formatCurrency";
import { ArrowLeft, Smartphone, Building, CreditCard, Copy, ShieldAlert, Clock, Check } from "lucide-react";

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planParam = searchParams.get("plan") || "monthly";

  const [regData, setRegData] = useState({});
  const [plansData, setPlansData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("smartpos_registration");
    if (raw) setRegData(JSON.parse(raw));
    Promise.all([landingApi.getPlans(), landingApi.getPaymentMethods()])
      .then(([plansRes, methodsRes]) => {
        if (plansRes.success) setPlansData(plansRes.plans);
        if (methodsRes.success) setPaymentMethods(methodsRes.methods);
      })
      .finally(() => setLoading(false));
  }, []);

  const planPricesKES = { monthly: 500, yearly: 5000, permanent: 12000 };
  const amountKES = planPricesKES[planParam] || 500;
  const displayCurrency = plansData?.currency || "KES";
  const planLabel = planParam.charAt(0).toUpperCase() + planParam.slice(1);
  const priceKey = planParam === "monthly" ? "priceMonthly" : planParam === "yearly" ? "priceYearly" : "pricePermanent";
  const convertedPrice = plansData?.[priceKey] || amountKES;

  const finalizeRegistration = async (method) => {
    setSubmitting(true);
    setError("");
    const regRes = await authApi.registerPending({
      businessName: regData.businessName, ownerName: regData.ownerName, email: regData.email,
      phone: regData.phone, password: regData.password, currency: "KES", plan: planParam,
    });
    if (!regRes.success) { setError(regRes.message || "Registration failed."); setSubmitting(false); return; }
    const clientId = regRes.clientId || regRes.client?._id || regRes.client?.id;
    try { await landingApi.initiatePayment({ clientId, amount: amountKES, currency: "KES", method, billingCycle: planParam, ...(mpesaPhone && { phone: mpesaPhone }) }); } catch {}
    sessionStorage.removeItem("smartpos_registration");
    setSuccess(true);
    setSubmitting(false);
  };

  const getMpesaDetails = () => {
    if (!paymentMethods?.mpesaMethods) return null;
    const m = paymentMethods.mpesaMethods;
    switch (selectedMethod) {
      case "mpesa_send": return { label: "Send Money", number: m.sendMoneyPhoneNumber, steps: ["Go to M-Pesa menu", "Select Send Money", `Enter number: ${m.sendMoneyPhoneNumber}`, `Enter amount: ${formatPrice(amountKES, "KES")}`, "Enter your PIN", "Confirm and send"] };
      case "mpesa_till": return { label: "Till Number", number: m.tillNumber, steps: ["Go to M-Pesa menu", "Select Buy Goods and Services", `Enter Till Number: ${m.tillNumber}`, `Enter amount: ${formatPrice(amountKES, "KES")}`, "Enter your PIN", "Confirm payment"] };
      case "mpesa_paybill": return { label: "Paybill", number: `${m.paybillBusinessNumber} (${m.paybillAccountName})`, steps: ["Go to M-Pesa menu", "Select Paybill", `Enter Business Number: ${m.paybillBusinessNumber}`, `Enter Account: ${m.paybillAccountName || "SmartPOS"}`, `Enter amount: ${formatPrice(amountKES, "KES")}`, "Enter your PIN", "Confirm payment"] };
      default: return null;
    }
  };

  const mpesaDetails = getMpesaDetails();

  if (loading) return <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><Spinner /></div>;

  if (!regData.email) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Registration Data</h2>
          <p className="text-sm text-gray-500 mb-4">Please register first.</p>
          <Link to="/pricing"><Button>Go to Pricing</Button></Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5"><Check className="w-8 h-8 text-green-600" /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Submitted!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your payment is pending admin approval. You'll receive your license key via email once approved.</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6"><p className="text-xs text-yellow-700 dark:text-yellow-400">Approvals typically take a few minutes during business hours.</p></div>
          <Button className="w-full" onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link to="/register" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{planLabel} Plan — {formatPrice(amountKES, "KES")}{displayCurrency !== "KES" && ` (${formatPrice(convertedPrice, displayCurrency)})`}</p>

          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Select Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {paymentMethods?.mpesaEnabled && paymentMethods.mpesaMethods?.stkPush && (
              <button onClick={() => setSelectedMethod("mpesa_stk")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "mpesa_stk" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><Smartphone className="w-6 h-6 text-green-600 mb-2" /><p className="font-medium text-gray-900 dark:text-white">M-Pesa STK Push</p><p className="text-xs text-gray-500">Instant prompt to your phone</p></button>
            )}
            {paymentMethods?.mpesaEnabled && paymentMethods.mpesaMethods?.sendMoney && (
              <button onClick={() => setSelectedMethod("mpesa_send")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "mpesa_send" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><Smartphone className="w-6 h-6 text-green-600 mb-2" /><p className="font-medium text-gray-900 dark:text-white">M-Pesa Send Money</p><p className="text-xs text-gray-500">Manual — send to our number</p></button>
            )}
            {paymentMethods?.mpesaEnabled && paymentMethods.mpesaMethods?.till && (
              <button onClick={() => setSelectedMethod("mpesa_till")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "mpesa_till" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><Building className="w-6 h-6 text-green-600 mb-2" /><p className="font-medium text-gray-900 dark:text-white">M-Pesa Till Number</p><p className="text-xs text-gray-500">Manual — pay via Buy Goods</p></button>
            )}
            {paymentMethods?.mpesaEnabled && paymentMethods.mpesaMethods?.paybill && (
              <button onClick={() => setSelectedMethod("mpesa_paybill")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "mpesa_paybill" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><Building className="w-6 h-6 text-green-600 mb-2" /><p className="font-medium text-gray-900 dark:text-white">M-Pesa Paybill</p><p className="text-xs text-gray-500">Manual — pay via Paybill</p></button>
            )}
            {paymentMethods?.stripeEnabled && (
              <button onClick={() => setSelectedMethod("stripe")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "stripe" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><CreditCard className="w-6 h-6 text-blue-600 mb-2" /><p className="font-medium text-gray-900 dark:text-white">Credit / Debit Card</p><p className="text-xs text-gray-500">Pay securely via Stripe</p></button>
            )}
            {paymentMethods?.paypalEnabled && (
              <button onClick={() => setSelectedMethod("paypal")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === "paypal" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800"}`}><CreditCard className="w-6 h-6 text-blue-800 mb-2" /><p className="font-medium text-gray-900 dark:text-white">PayPal</p><p className="text-xs text-gray-500">Pay via PayPal</p></button>
            )}
          </div>

          {selectedMethod === "mpesa_stk" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">M-Pesa STK Push</h3>
              <Input label="M-Pesa Phone Number" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712345678" />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              <Button size="lg" className="w-full mt-4" onClick={() => finalizeRegistration("mpesa")} loading={submitting}>Pay {formatPrice(amountKES, "KES")} via STK Push</Button>
            </div>
          )}

          {mpesaDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{mpesaDetails.label} — Payment Guide</h3>
              {mpesaDetails.number && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-gray-500">Pay to:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{mpesaDetails.number}</span>
                  <button onClick={() => navigator.clipboard.writeText(mpesaDetails.number.replace(/\s.*/, "").trim())} className="text-primary-600"><Copy className="w-4 h-4" /></button>
                </div>
              )}
              <ol className="space-y-2 mb-6">
                {mpesaDetails.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {selectedMethod && selectedMethod !== "mpesa_stk" && (
            <>
              {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
              <div className="flex items-start gap-2 mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800"><Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-yellow-700 dark:text-yellow-400">Registration without payment will be automatically rejected after 3 hours.</p></div>
              <Button size="lg" className="w-full" onClick={() => setShowConfirm(true)} loading={submitting}>I've Paid — Submit Registration</Button>
            </>
          )}

          {!selectedMethod && <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Select a payment method above to continue.</p>}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldAlert className="w-6 h-6 text-yellow-600" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Payment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Have you completed the M-Pesa payment?</p>
            <p className="text-xs text-red-600 dark:text-red-400 mb-4">⚠️ False submissions will be auto-rejected after 3 hours. Only confirm if you have received your M-Pesa confirmation SMS.</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={() => { setShowConfirm(false); finalizeRegistration(selectedMethod); }}>Confirm Payment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
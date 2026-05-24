// components/settings/SubscriptionSettings.jsx
import { useState, useEffect } from "react";
import { subscriptionApi } from "../../api/subscriptionApi";
import { Spinner } from "../ui/Spinner";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export const SubscriptionSettings = () => {
  const [sub, setSub] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([subscriptionApi.get(), subscriptionApi.getPayments()])
      .then(([subRes, payRes]) => {
        if (subRes.success && subRes.data) setSub(subRes.data);
        if (payRes.success && payRes.data) setPayments(payRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">Plan</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{sub?.plan || "N/A"}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">Status</p>
          <p className={`text-lg font-bold capitalize ${sub?.status === "active" ? "text-green-600" : "text-red-500"}`}>{sub?.status || "N/A"}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">Start Date</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(sub?.startDate)}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">Expiry</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(sub?.expiryDate)}</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment History</h3>
      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(p.amount)}</p>
              <p className="text-xs text-gray-500">{p.method} — {p.billingCycle}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium capitalize ${p.status === "approved" ? "text-green-600" : p.status === "pending" ? "text-yellow-600" : "text-red-500"}`}>{p.status}</p>
              <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No payments yet.</p>}
      </div>
    </div>
  );
};
// pages/app/Customers.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customerApi } from "../../api/customerApi";
import { settingsApi } from "../../api/settingsApi";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { Plus, Users, Phone, Mail, CreditCard, Gift, Printer, Eye, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({ receiptHeader: "" });

  const fetchCustomers = () => {
    setLoading(true);
    customerApi.getAll({ search, limit: 50 }).then((res) => {
      if (res.success) setCustomers(res.data?.customers || res.customers || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
    settingsApi.getReceipt().then((res) => {
      if (res.success) setReceiptSettings({ receiptHeader: (res.data || res).receiptHeader || "" });
    }).catch(() => {});
  }, [search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await customerApi.remove(deleteId);
      if (res.success) { toast.success("Customer deleted."); setDeleteId(null); fetchCustomers(); }
      else toast.error(res.message || "Failed to delete.");
    } catch { toast.error("Delete failed."); }
    setDeleting(false);
  };

  const handlePrintCard = (customer) => {
    const businessName = receiptSettings.receiptHeader?.split("\n")[0] || "SmartPOS";
    const cardNumber = customer.loyaltyCardNumber || customer.phone || "N/A";
    const content = `
      <div style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:space-between;padding:24px 32px;border:2px solid #2563eb;border-radius:12px;max-width:560px;height:200px;margin:0 auto;box-sizing:border-box;">
        <div style="flex:1;">
          <h2 style="color:#2563eb;margin:0;font-size:16px;">${businessName}</h2>
          <p style="font-size:10px;color:#888;margin:2px 0 12px;">Loyalty Card</p>
          <h1 style="margin:0;font-size:22px;color:#1e293b;">${customer.name}</h1>
          <p style="font-size:12px;color:#555;margin:4px 0;">Card: ${cardNumber}</p>
          <p style="font-size:11px;color:#888;margin:8px 0 0;">${formatDate(customer.createdAt)}${customer.email ? ` • ${customer.email}` : ""}</p>
        </div>
        <div style="text-align:center;border-left:2px dashed #e5e7eb;padding-left:28px;margin-left:28px;">
          <div style="width:80px;height:80px;background:#f0f9ff;border:2px solid #2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:9px;color:#2563eb;text-align:center;">LOYALTY<br>CARD</span>
          </div>
          <p style="font-size:9px;color:#aaa;margin:8px 0 0;">${businessName}</p>
        </div>
      </div>
    `;
    const printWindow = window.open("", "", "width=620,height=300");
    printWindow.document.write(`<html><head><title>Loyalty Card - ${customer.name}</title><style>@media print{body{margin:20px;}}</style></head><body style="margin:20px;display:flex;justify-content:center;align-items:center;min-height:250px;">${content}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalCustomers = customers.length;
  const topCustomer = customers.reduce((max, c) => (c.loyaltyPoints || 0) > (max?.loyaltyPoints || 0) ? c : max, null);

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1><p className="text-sm text-gray-500 mt-1">{totalCustomers} customers</p></div>
        <Link to="/app/customers/new"><Button size="sm"><Plus className="w-4 h-4" /> Add Customer</Button></Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-500">Total Customers</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-2"><Gift className="w-5 h-5 text-yellow-600" /><span className="text-sm text-gray-500">Total Points</span></div>
          <p className="text-2xl font-bold text-yellow-600">{totalPoints}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-2"><Gift className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-500">Top Customer</span></div>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{topCustomer?.name || "—"}</p>
          <p className="text-xs text-gray-500">{topCustomer ? `${topCustomer.loyaltyPoints || 0} points` : ""}</p>
        </div>
      </div>

      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, email, or card number..." /></div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description={search ? "Try a different search." : "Add your first customer."} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><span className="text-sm font-bold text-primary-600">{c.name?.charAt(0)}</span></div>
                <div className="flex-1"><p className="font-medium text-gray-900 dark:text-white">{c.name}</p><p className="text-xs text-gray-500">Joined {formatDate(c.createdAt)}</p></div>
              </div>
              {c.phone && <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</div>}
              {c.email && <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Mail className="w-3.5 h-3.5" /> {c.email}</div>}
              {c.loyaltyCardNumber && <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><CreditCard className="w-3.5 h-3.5" /> {c.loyaltyCardNumber}</div>}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-600 flex items-center gap-1"><Gift className="w-4 h-4" /> {c.loyaltyPoints || 0} pts</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedCustomer(c)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><Eye className="w-4 h-4" /></button>
                  <Link to={`/app/customers/${c._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><Edit className="w-4 h-4" /></Link>
                  <button onClick={() => handlePrintCard(c)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><Printer className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Customer Details" size="md">
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><span className="text-xl font-bold text-primary-600">{selectedCustomer.name?.charAt(0)}</span></div>
              <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</h2><p className="text-xs text-gray-500">Customer since {formatDate(selectedCustomer.createdAt)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium">{selectedCustomer.phone || "—"}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{selectedCustomer.email || "—"}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Card Number</p><p className="text-sm font-medium">{selectedCustomer.loyaltyCardNumber || "—"}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Loyalty Points</p><p className="text-lg font-bold text-yellow-600">{selectedCustomer.loyaltyPoints || 0}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Total Spent</p><p className="text-sm font-medium">{formatCurrency(selectedCustomer.totalSpent || 0)}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Visits</p><p className="text-sm font-medium">{selectedCustomer.visitCount || 0}</p></div>
            </div>
            <div className="flex gap-3">
              <Link to={`/app/customers/${selectedCustomer._id}/edit`} className="flex-1"><Button variant="outline" className="w-full"><Edit className="w-4 h-4" /> Edit</Button></Link>
              <Button variant="outline" className="flex-1" onClick={() => handlePrintCard(selectedCustomer)}><Printer className="w-4 h-4" /> Print Card</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Customer" message="This customer will be permanently removed." loading={deleting} />
    </div>
  );
};
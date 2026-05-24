// pages/app/Sales.jsx
import { useState, useEffect } from "react";
import { saleApi } from "../../api/saleApi";
import { settingsApi } from "../../api/settingsApi";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/ui/Spinner";
import { SearchBar } from "../../components/ui/SearchBar";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { formatPrice } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { Receipt, RotateCcw, Printer, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSale, setSelectedSale] = useState(null);
  const [refundId, setRefundId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [refunding, setRefunding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({
    receiptHeader: "", receiptFooter: "Thank you for shopping with us!",
    vatEnabled: false, vatRate: 0, globalDiscountEnabled: false,
  });
  const limit = 20;

  const isOwner = user?.role === "owner";
  const isManager = user?.role === "manager";
  const canDelete = isOwner || isManager;

  useEffect(() => {
    settingsApi.getReceipt().then((res) => {
      if (res.success) {
        const data = res.data || res;
        setReceiptSettings({
          receiptHeader: data.receiptHeader || "",
          receiptFooter: data.receiptFooter || "Thank you for shopping with us!",
          vatEnabled: data.vatEnabled === true,
          vatRate: data.vatRate || 0,
          globalDiscountEnabled: data.globalDiscountEnabled === true,
        });
      }
    }).catch(() => {});
  }, []);

  const fetchSales = () => {
    setLoading(true);
    const params = { receipt: search, page, limit };
    if (user?.role === "cashier") params.cashier = user.id;
    saleApi.getAll(params).then((res) => {
      if (res.success) {
        const list = res.data?.sales || res.sales || [];
        setSales(list);
        setTotal(res.data?.total || res.total || 0);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSales(); }, [page, search]);

  const handleRefund = async () => {
    setRefunding(true);
    const res = await saleApi.refund(refundId, { reason: "Customer return" });
    if (res.success) { toast.success("Refund processed."); setRefundId(null); fetchSales(); }
    else toast.error(res.message || "Refund failed.");
    setRefunding(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await saleApi.remove(deleteId);
      if (res.success) { toast.success("Sale deleted."); setDeleteId(null); fetchSales(); }
      else toast.error(res.message || "Failed to delete.");
    } catch { toast.error("Delete failed."); }
    setDeleting(false);
  };

  const handlePrint = (sale) => {
    const header = receiptSettings.receiptHeader || "SmartPOS";
    const footer = receiptSettings.receiptFooter || "Thank you for shopping with us!";

    const lines = [];
    header.split("\n").forEach((l) => lines.push('<p style="font-weight:bold;margin:0;color:#2563eb;text-align:center;">' + (l || " ") + "</p>"));
    lines.push('<p style="color:#16a34a;font-size:10px;margin:4px 0;">' + formatDateTime(sale.createdAt) + "</p>");
    lines.push('<p style="color:#16a34a;font-size:10px;margin:0;">Receipt: #' + (sale.receiptNumber || sale._id?.slice(-6)).toUpperCase() + "</p>");
    if (sale.cashier?.name) lines.push('<p style="color:#16a34a;font-size:10px;margin:0;">Cashier: ' + sale.cashier.name + "</p>");
    if (sale.customerName) lines.push('<p style="color:#16a34a;font-size:10px;margin:0;">Customer: ' + sale.customerName + "</p>");
    lines.push('<hr style="border:none;border-top:1px dashed #000;margin:6px 0;" />');

    (sale.items || []).forEach((item) => {
      lines.push('<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>' + (item.name || item.productId?.name || "Item") + " x" + item.quantity + "</span><span>" + formatPrice((item.price || 0) * (item.quantity || 1)) + "</span></div>");
    });

    lines.push('<hr style="border:none;border-top:1px dashed #000;margin:6px 0;" />');
    lines.push('<div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>' + formatPrice(sale.subtotal || 0) + "</span></div>");

    if (receiptSettings.globalDiscountEnabled || sale.discount > 0) {
      lines.push('<div style="display:flex;justify-content:space-between;color:#059669;"><span>Discount</span><span>-' + formatPrice(sale.discount || 0) + "</span></div>");
    }

    if (receiptSettings.vatEnabled || sale.vatAmount > 0) {
      lines.push('<div style="display:flex;justify-content:space-between;color:#dc2626;"><span>VAT (' + (sale.vatRate || receiptSettings.vatRate || 0) + "%)</span><span>" + formatPrice(sale.vatAmount || 0) + "</span></div>");
    }

    lines.push('<hr style="border:none;border-top:1px dashed #000;margin:6px 0;" />');
    lines.push('<div style="display:flex;justify-content:space-between;font-weight:bold;"><span>Total</span><span>' + formatPrice(sale.total) + "</span></div>");
    lines.push('<p style="margin:4px 0;font-size:10px;">Payment: ' + sale.paymentMethod + "</p>");

    if (sale.paymentMethod === "cash" && sale.amountPaid) {
      lines.push('<div style="display:flex;justify-content:space-between;font-size:10px;"><span>Paid: ' + formatPrice(sale.amountPaid) + "</span><span>Change: " + formatPrice(sale.changeAmount || 0) + "</span></div>");
    }

    lines.push('<p style="margin:8px 0;color:#888;">' + footer + "</p>");
    lines.push('<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0;" />');
    lines.push('<p style="color:#aaa;font-size:9px;margin:0;">Generated by SmartPOS on ' + new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</p>");

    const content = lines.join("\n");
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write("<html><head><title>Receipt</title></head><body style=\"margin:10px;color:#000;background:#fff;\">" + content + "</body></html>");
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const pages = Math.ceil(total / limit);
  const getStatusColor = (s) => s === "completed" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
  const getPaymentBadge = (m) => m === "mpesa" ? "bg-green-100 dark:bg-green-900/20 text-green-700" : m === "card" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700" : "bg-gray-100 dark:bg-gray-700 text-gray-600";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} transactions</p>
      </div>
      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by receipt number..." /></div>
      {loading ? <Spinner className="py-12" /> : sales.length === 0 ? (
        <EmptyState icon={Receipt} title="No sales found" description={search ? "Try a different receipt number." : "Process a sale in POS."} />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Receipt</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Items</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Payment</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sales.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="py-3 px-4"><p className="font-mono text-xs font-medium text-gray-900 dark:text-white">{s.receiptNumber}</p>{s.customerName && <p className="text-xs text-gray-500">{s.customerName}</p>}</td>
                      <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">{s.items?.length || 0}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatPrice(s.total)}</td>
                      <td className="py-3 px-4 text-center hidden md:table-cell"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getPaymentBadge(s.paymentMethod)}`}>{s.paymentMethod}</span></td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(s.status)}`}>{s.status}</span></td>
                      <td className="py-3 px-4 text-right text-gray-500 text-xs hidden lg:table-cell">{formatDateTime(s.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedSale(s)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Receipt className="w-4 h-4" /></button>
                          <button onClick={() => handlePrint(s)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Printer className="w-4 h-4" /></button>
                          {s.status === "completed" && <button onClick={() => setRefundId(s._id)} className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"><RotateCcw className="w-4 h-4" /></button>}
                          {canDelete && <button onClick={() => setDeleteId(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
      <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Receipt" size="md">
        {selectedSale && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500">{selectedSale.receiptNumber}</span><span className="text-gray-500">{formatDateTime(selectedSale.createdAt)}</span></div>
            {selectedSale.customerName && <p className="text-sm text-gray-500">Customer: {selectedSale.customerName}</p>}
            <div className="border-t pt-3 space-y-2">{selectedSale.items?.map((item, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-900 dark:text-white">{item.name || item.productId?.name} x{item.quantity}</span><span className="text-gray-500">{formatPrice(item.total || item.price * item.quantity)}</span></div>)}</div>
            <div className="border-t pt-3 space-y-1">
              {selectedSale.discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span style={{ color: "#059669" }}>-{formatPrice(selectedSale.discount)}</span></div>}
              {selectedSale.vatAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">VAT ({selectedSale.vatRate || 0}%)</span><span style={{ color: "#dc2626" }}>{formatPrice(selectedSale.vatAmount)}</span></div>}
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(selectedSale.total)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="capitalize">{selectedSale.paymentMethod}</span></div>
              {selectedSale.paymentMethod === "cash" && selectedSale.amountPaid > 0 && (
                <div className="flex justify-between text-sm"><span className="text-gray-500">Paid / Change</span><span>{formatPrice(selectedSale.amountPaid)} / {formatPrice(selectedSale.changeAmount || 0)}</span></div>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!refundId} onClose={() => setRefundId(null)} onConfirm={handleRefund} title="Process Refund" message="Refund this sale? Stock will be restored." loading={refunding} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Sale" message="This sale will be permanently removed." loading={deleting} />
    </div>
  );
};
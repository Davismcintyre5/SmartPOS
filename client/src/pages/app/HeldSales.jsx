// pages/app/HeldSales.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { posApi } from "../../api/posApi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatPrice } from "../../utils/formatCurrency";
import { Pause, Play, Trash2, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export const HeldSales = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [heldSales, setHeldSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHeldSales = async () => {
    try {
      const res = await posApi.getHeldSales();
      if (res.success) {
        let sales = res.data?.sales || res.data || res.sales || [];
        if (!Array.isArray(sales)) sales = [];
        if (user?.role === "cashier") sales = sales.filter((s) => s.cashier === user.id);
        setHeldSales(sales);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchHeldSales(); }, []);

  const handleResume = (sale) => {
    sessionStorage.setItem("resume_sale", JSON.stringify(sale));
    sessionStorage.setItem("resumed_sale_id", sale._id);
    navigate("/app/pos");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await posApi.removeHeldSale(deleteId);
      if (res.success) {
        toast.success("Held sale deleted.");
        setDeleteId(null);
        fetchHeldSales();
      } else {
        toast.error(res.message || "Failed to delete.");
      }
    } catch {
      toast.error("Delete failed.");
    }
    setDeleting(false);
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Held Sales</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{heldSales.length} held sales</p>
      </div>

      {heldSales.length === 0 ? (
        <EmptyState
          icon={Pause}
          title="No held sales"
          description="Hold a sale in POS to see it here."
          action={<Button onClick={() => navigate("/app/pos")}><ShoppingCart className="w-4 h-4" /> Go to POS</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heldSales.map((sale) => (
            <div key={sale._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-mono">{sale.receiptNumber || sale._id?.slice(-8)}</span>
                <button onClick={() => setDeleteId(sale._id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formatPrice(sale.total)}</p>
              <p className="text-sm text-gray-500 mb-1">{sale.items?.length || 0} items</p>
              {sale.customerName && <p className="text-xs text-gray-400 mb-3">{sale.customerName}</p>}
              <div className="space-y-1 mb-4">
                {sale.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-500">
                    <span>{item.name || "Item"} x{item.quantity}</span>
                    <span>{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                  </div>
                ))}
                {sale.items?.length > 3 && <p className="text-xs text-gray-400">+{sale.items.length - 3} more items</p>}
              </div>
              <Button className="w-full" size="sm" onClick={() => handleResume(sale)}>
                <Play className="w-4 h-4" /> Resume Sale
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Held Sale"
        message="This held sale will be permanently removed."
        loading={deleting}
      />
    </div>
  );
};
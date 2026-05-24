// pages/app/Products.jsx — add Categories tab and update
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { useAuth } from "../../hooks/useAuth";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { formatPrice } from "../../utils/formatCurrency";
import { Plus, Edit, Trash2, Package, Barcode, Camera, CameraOff, ScanLine, ArrowUp, Search, Tags, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export const Products = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  const canManage = hasPermission("manageProducts");

  const fetchProducts = async () => {
    setLoading(true);
    const res = await productApi.getAll();
    if (res.success) setProducts(res.data?.products || res.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleScan = useCallback((barcode) => {
    if (!canManage) { toast.error("You don't have permission."); return; }
    const existing = products.find((p) => p.barcode === barcode);
    if (existing) { toast.error(`Barcode already exists: ${existing.name}`); return; }
    setCameraOn(false);
    sessionStorage.setItem("quick_barcode", barcode);
    navigate("/app/products/new");
  }, [canManage, products, navigate]);

  useBarcodeScanner({ onScan: handleScan, enabled: !loading && cameraOn, cameraEnabled: cameraOn });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await productApi.remove(deleteId);
    if (res.success) { toast.success("Product deleted."); setDeleteId(null); fetchProducts(); }
    else toast.error(res.message || "Failed to delete.");
    setDeleting(false);
  };

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.toLowerCase().includes(search.toLowerCase()))
    : products;

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  if (loading) return <Spinner className="py-20" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <div className="flex items-center gap-2">
          {canManage && (
            <button onClick={() => setCameraOn(!cameraOn)} className={`p-2 rounded-lg border transition-colors ${cameraOn ? "bg-primary-50 border-primary-500 text-primary-600" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500"}`}>
              {cameraOn ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </button>
          )}
          {canManage && <Link to="/app/products/new"><Button><Plus className="w-4 h-4" /> Add Product</Button></Link>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button onClick={() => setActiveTab("products")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "products" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Products</button>
        {canManage && (
          <>
            <button onClick={() => setActiveTab("restock")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "restock" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <ArrowUp className="w-4 h-4 inline mr-1" /> Restock
            </button>
            <button onClick={() => setActiveTab("categories")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "categories" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Tags className="w-4 h-4 inline mr-1" /> Categories
            </button>
          </>
        )}
      </div>

      {cameraOn && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <video id="camera-preview" className="w-full h-40 object-cover bg-black" />
          <div className="bg-gray-900 text-white text-xs text-center py-1"><ScanLine className="w-4 h-4 inline mr-1" />Scan barcode to quickly add a new product</div>
        </div>
      )}

      {activeTab === "products" && (
        <>
          <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or barcode..." /></div>
          {filtered.length === 0 ? (
            <EmptyState icon={Package} title="No products found" description={search ? "No products match your search." : "Start by adding your first product."}
              action={!search && canManage && <Link to="/app/products/new"><Button>Add Product</Button></Link>} />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Barcode</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    {canManage && <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category || "Uncategorized"}</p>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {product.barcode ? <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Barcode className="w-3 h-3" /> {product.barcode}</span> : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">{formatPrice(product.price)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-medium ${product.stock <= 5 ? "text-red-600" : product.stock <= 10 ? "text-yellow-600" : "text-green-600"}`}>{product.stock}</span>
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/app/products/${product._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary-600"><Edit className="w-4 h-4" /></Link>
                              <button onClick={() => setDeleteId(product._id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "restock" && canManage && <RestockTab products={products} onRestock={fetchProducts} />}
      {activeTab === "categories" && canManage && <CategoriesTab products={products} onUpdate={fetchProducts} />}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="This product will be permanently removed." loading={deleting} />
    </div>
  );
};

// Restock Tab
const RestockTab = ({ products, onRestock }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.toLowerCase().includes(search.toLowerCase()))
    : products.slice(0, 20);

  const handleRestock = async () => {
    if (!selected || !quantity || Number(quantity) <= 0) { toast.error("Select a product and enter a valid quantity."); return; }
    setSaving(true);
    const updates = { stock: selected.stock + Number(quantity) };
    if (price && Number(price) > 0) updates.price = Number(price);
    try {
      const res = await productApi.update(selected._id, updates);
      if (res.success) { toast.success(`${selected.name} restocked to ${updates.stock} units.`); setSelected(null); setQuantity(""); setPrice(""); onRestock(); }
      else toast.error(res.message || "Restock failed.");
    } catch { toast.error("Restock failed."); }
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filtered.map((p) => (
            <button key={p._id} onClick={() => { setSelected(p); setPrice(""); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selected?._id === p._id ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
              <div className="flex justify-between"><span className="font-medium truncate">{p.name}</span><span className={`text-xs ${p.stock <= 5 ? "text-red-500" : "text-gray-500"}`}>{p.stock} in stock</span></div>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        {selected ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Restock: {selected.name}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Current Stock</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{selected.stock}</p></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500">Current Price</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(selected.price)}</p></div>
            </div>
            <div className="space-y-3">
              <Input label="Quantity to Add" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" />
              <Input label="New Price (optional)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave blank to keep current" />
              <Button onClick={handleRestock} loading={saving} className="w-full"><ArrowUp className="w-4 h-4" /> Restock {quantity ? `+${quantity} units` : ""}</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 py-20"><div className="text-center"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-sm">Select a product to restock</p></div></div>
        )}
      </div>
    </div>
  );
};

// Categories Tab
const CategoriesTab = ({ products, onUpdate }) => {
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRename = async (oldName) => {
    if (!editValue.trim() || editValue === oldName) { setEditingCategory(null); return; }
    setSaving(true);
    const toUpdate = products.filter((p) => p.category === oldName);
    try {
      await Promise.all(toUpdate.map((p) => productApi.update(p._id, { category: editValue })));
      toast.success(`Category renamed to "${editValue}".`);
      setEditingCategory(null);
      onUpdate();
    } catch { toast.error("Failed to rename category."); }
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) { toast.error("Category already exists."); return; }
    // Just save it — it will appear when a product uses it
    setNewCategory("");
    toast.success(`Category "${newCategory}" will be available when adding products.`);
  };

  const categoryCount = (cat) => products.filter((p) => p.category === cat).length;

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex gap-2">
        <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="flex-1" />
        <Button size="sm" onClick={handleAdd}><Plus className="w-4 h-4" /> Add</Button>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {editingCategory === cat ? (
              <div className="flex items-center gap-2 flex-1">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm" autoFocus />
                <button onClick={() => handleRename(cat)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat}</span>
                  <span className="text-xs text-gray-500 ml-2">{categoryCount(cat)} products</span>
                </div>
                <button onClick={() => { setEditingCategory(cat); setEditValue(cat); }} className="p-1.5 text-gray-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-gray-500 py-8 text-center">No categories yet. They auto-fill when you add products.</p>}
      </div>
    </div>
  );
};
// pages/app/ProductForm.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { useAuth } from "../../hooks/useAuth";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { ArrowLeft, Camera, CameraOff } from "lucide-react";
import toast from "react-hot-toast";

export const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const isEdit = !!id;
  const canManage = hasPermission("manageProducts");

  const [form, setForm] = useState({ name: "", barcode: "", price: "", cost: "", stock: "", category: "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!canManage) { toast.error("You don't have permission."); navigate("/app/products"); }
  }, [canManage, navigate]);

  useEffect(() => {
    productApi.getAll({ limit: 200 }).then((res) => {
      if (res.success) {
        const products = res.data?.products || res.products || [];
        const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
        setCategorySuggestions(cats);
      }
    }).catch(() => {});
  }, []);

  const handleBarcodeScan = useCallback((barcode) => {
    setForm((prev) => ({ ...prev, barcode }));
    toast.success(`Barcode: ${barcode}`);
  }, []);

  useBarcodeScanner({ onScan: handleBarcodeScan, enabled: !isEdit && cameraOn, cameraEnabled: cameraOn });

  useEffect(() => {
    const savedBarcode = sessionStorage.getItem("quick_barcode");
    if (savedBarcode) { setForm((prev) => ({ ...prev, barcode: savedBarcode })); sessionStorage.removeItem("quick_barcode"); }
    if (isEdit) {
      productApi.getById(id).then((res) => {
        if (res.success) {
          const p = res.product || res.data;
          setForm({ name: p.name || "", barcode: p.barcode || "", price: p.price || "", cost: p.cost || "", stock: p.stock || "", category: p.category || "" });
        }
        setLoading(false);
      });
    } else { setLoading(false); }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filteredSuggestions = form.category
    ? categorySuggestions.filter((c) => c.toLowerCase().includes(form.category.toLowerCase()) && c.toLowerCase() !== form.category.toLowerCase())
    : categorySuggestions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Name and price are required.");
    setSaving(true);
    const data = { name: form.name, barcode: form.barcode, price: Number(form.price), cost: Number(form.cost) || 0, stock: Number(form.stock) || 0, category: form.category };
    const res = isEdit ? await productApi.update(id, data) : await productApi.create(data);
    if (res.success) { toast.success(isEdit ? "Updated!" : "Created!"); navigate("/app/products"); }
    else toast.error(res.message || "Failed to save.");
    setSaving(false);
  };

  if (!canManage) return null;
  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate("/app/products")} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEdit ? "Edit Product" : "Add Product"}</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Blue Band 500g" required />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode</label>
            <div className="flex gap-2">
              <input type="text" name="barcode" value={form.barcode} onChange={handleChange} placeholder="Scan or type barcode" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {!isEdit && (
                <button type="button" onClick={() => setCameraOn(!cameraOn)} className={`px-3 py-2 rounded-lg border transition-colors ${cameraOn ? "bg-primary-50 border-primary-500 text-primary-600" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500"}`}>
                  {cameraOn ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              )}
            </div>
            {cameraOn && <div className="mt-2 rounded-lg overflow-hidden border"><video id="camera-preview" className="w-full h-48 object-cover bg-black" /></div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Selling Price" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" required />
            <Input label="Cost Price" name="cost" type="number" value={form.cost} onChange={handleChange} placeholder="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
            <div className="relative">
              <Input label="Category" name="category" value={form.category} onChange={(e) => { handleChange(e); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Type or select" />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                  {filteredSuggestions.map((c) => (
                    <button key={c} type="button" onMouseDown={() => { setForm({ ...form, category: c }); setShowSuggestions(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">{c}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate("/app/products")}>Cancel</Button>
            <Button type="submit" loading={saving}>{isEdit ? "Update" : "Create"} Product</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
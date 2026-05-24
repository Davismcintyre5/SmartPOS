// pages/app/CustomerForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerApi } from "../../api/customerApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { ArrowLeft, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: "", phone: "", email: "", loyaltyCardNumber: "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      customerApi.getOne(id).then((res) => {
        if (res.success) {
          const c = res.data || res;
          setForm({
            name: c.name || "",
            phone: c.phone || "",
            email: c.email || "",
            loyaltyCardNumber: c.loyaltyCardNumber || "",
          });
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required.");
    setError("");
    setSaving(true);
    try {
      const data = {
        name: form.name,
        phone: form.phone || "",
        email: form.email || "",
        loyaltyCardNumber: form.loyaltyCardNumber || "",
      };
      if (isEdit) {
        await customerApi.update(id, data);
        toast.success("Customer updated.");
      } else {
        await customerApi.create(data);
        toast.success("Customer created.");
      }
      navigate("/app/customers");
    } catch (err) {
      setError(err?.message || "Failed to save customer.");
    }
    setSaving(false);
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="max-w-md">
      <button onClick={() => navigate("/app/customers")} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEdit ? "Edit Customer" : "Add Customer"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Card number will be auto-generated.
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={saving}>{isEdit ? "Update" : "Create"} Customer</Button>
          <Button variant="ghost" onClick={() => navigate("/app/customers")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};
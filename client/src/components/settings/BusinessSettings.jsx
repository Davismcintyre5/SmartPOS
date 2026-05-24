// components/settings/BusinessSettings.jsx
import { useState, useEffect } from "react";
import { settingsApi } from "../../api/settingsApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";

export const BusinessSettings = () => {
  const [form, setForm] = useState({ businessName: "", ownerName: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    settingsApi.getBusiness().then((res) => {
      if (res.success && res.data) setForm(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateBusiness(form);
      setSuccess("Business settings updated");
    } catch {}
    setSaving(false);
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        <Input label="Owner Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        <Input label="Contact Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button type="submit" loading={saving}>Save</Button>
      </form>
    </div>
  );
};
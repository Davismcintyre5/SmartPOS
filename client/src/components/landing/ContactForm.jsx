// ContactForm
import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { landingApi } from "../../api/landingApi";

export const ContactForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await landingApi.submitInquiry(form);
    if (res.success) {
      setForm({ name: "", email: "", subject: "", message: "" });
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
      </div>
      <Button type="submit" loading={loading} className="w-full">Send Message</Button>
    </form>
  );
};
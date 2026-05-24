// components/settings/ProfileSettings.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { settingsApi } from "../../api/settingsApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password && form.password !== form.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      const data = { name: form.name };
      if (form.password) data.password = form.password;
      await settingsApi.updateProfile(data);
      setSuccess("Profile updated");
      setForm({ ...form, password: "", confirmPassword: "" });
    } catch { setError("Failed to update"); }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" value={user?.email} disabled />
        <Input label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank" />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Leave blank" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button type="submit" loading={loading}>Save</Button>
      </form>
    </div>
  );
};
// components/settings/UserManagement.jsx
import { useState, useEffect } from "react";
import { userApi } from "../../api/userApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Trash2, Plus, X, Edit2, Shield } from "lucide-react";

const roles = ["admin", "manager", "cashier"];

const permissionsList = [
  { key: "manageProducts", label: "Manage Products" },
  { key: "processSales", label: "Process Sales" },
  { key: "manageCustomers", label: "Manage Customers" },
  { key: "viewReports", label: "View Reports" },
  { key: "manageStaff", label: "Manage Staff" },
  { key: "processRefunds", label: "Process Refunds" },
];

const emptyForm = {
  name: "", email: "", password: "", role: "cashier",
  permissions: { manageProducts: false, processSales: true, manageCustomers: false, viewReports: false, manageStaff: false, processRefunds: false },
};

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    userApi.getAll().then((res) => {
      if (res.success) setUsers(res.data || res || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const staffUsers = users.filter((u) => u.role !== "owner");
  const ownerUser = users.find((u) => u.role === "owner");

  const handleRoleChange = (role) => {
    const defaultPerms = {
      manageProducts: role === "admin" || role === "manager",
      processSales: true,
      manageCustomers: role === "admin" || role === "manager",
      viewReports: role === "admin" || role === "manager",
      manageStaff: role === "admin",
      processRefunds: role === "admin" || role === "manager",
    };
    setForm({ ...form, role, permissions: defaultPerms });
  };

  const togglePermission = (key) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || (!editingId && !form.password)) {
      return setError("Name, email, and password are required.");
    }
    setSaving(true);
    try {
      await userApi.register({ ...form });
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err?.message || "Failed to add user");
    }
    setSaving(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = { name: form.name, email: form.email, role: form.role, permissions: form.permissions };
      if (form.password) data.password = form.password;
      await userApi.update(editingId, data);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err?.message || "Failed to update user");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await userApi.remove(id);
    fetchUsers();
  };

  const openEdit = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "cashier",
      permissions: u.permissions || { ...emptyForm.permissions },
    });
    setEditingId(u._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff</h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Staff
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={editingId ? handleEdit : handleAdd} className="mb-6 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {editingId ? "Edit Staff" : "New Staff Member"}
            </h3>
            <button type="button" onClick={resetForm}>
              <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label={editingId ? "New Password (leave blank)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={form.role} onChange={(e) => handleRoleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                {roles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {permissionsList.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.permissions[perm.key]} onChange={() => togglePermission(perm.key)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={saving} size="sm">{editingId ? "Update Staff" : "Add Staff"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {ownerUser && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{ownerUser.name}</p>
                <p className="text-xs text-gray-500">{ownerUser.email}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Super Admin is read-only and cannot be modified here.</p>
        </div>
      )}

      <div className="space-y-2">
        {staffUsers.map((u) => (
          <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium capitalize px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                  {u.role}
                </span>
                {u.permissions && Object.entries(u.permissions).filter(([, v]) => v).length > 0 && (
                  <span className="text-xs text-gray-400">
                    {Object.entries(u.permissions).filter(([, v]) => v).map(([k]) => k.replace("manage", "").replace("process", "").replace("view", "")).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(u)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(u._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {staffUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No staff members yet.</p>
        )}
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LockKeyhole,
  Loader2,
} from "lucide-react";

import api from "../../api/axios";

type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "WAITER"
  | "KITCHEN"
  | "CASHIER";

type UserStatus = "ACTIVE" | "INACTIVE";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
}

const roleStyle: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  WAITER: "bg-orange-100 text-orange-700",
  KITCHEN: "bg-red-100 text-red-700",
  CASHIER: "bg-emerald-100 text-emerald-700",
};

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  WAITER: "Waiter",
  KITCHEN: "Kitchen",
  CASHIER: "Cashier",
};

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("WAITER");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("WAITER");
    setStatus("ACTIVE");
    setEditingUser(null);
    setShowForm(false);
    setError("");
  };

  const openAddForm = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("WAITER");
    setStatus("ACTIVE");
    setError("");
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setPassword("");
    setRole(user.role);
    setStatus(user.status);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editingUser && !password.trim()) {
      setError("Password is required for a new user.");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          role,
          status,
        });

        alert("User updated successfully.");
      } else {
        await api.post("/users", {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          password,
          role,
        });

        alert("User created successfully.");
      }

      await fetchUsers();
      resetForm();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);
      setError("");

      await api.delete(`/users/${user.id}`);

      await fetchUsers();

      alert("User deleted successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <UsersIcon size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Users
                </h1>

                <p className="text-sm text-slate-500">
                  Manage restaurant staff accounts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={19} />
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <UsersIcon size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active Users
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {activeUsers}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Inactive Users
                </p>

                <p className="mt-1 text-3xl font-bold text-red-600">
                  {inactiveUsers}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update user information and access"
                    : "Create a new restaurant staff account"}
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                icon={<UserRound size={17} />}
                value={name}
                onChange={setName}
                placeholder="Enter full name"
              />

              <Field
                label="Email"
                icon={<Mail size={17} />}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter email address"
              />

              <Field
                label="Phone"
                icon={<Phone size={17} />}
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
              />

              {!editingUser && (
                <Field
                  label="Password"
                  icon={<LockKeyhole size={17} />}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                />
              )}

              <SelectField
                label="Role"
                icon={<ShieldCheck size={17} />}
                value={role}
                onChange={(value) =>
                  setRole(value as UserRole)
                }
                options={[
                  { value: "ADMIN", label: "Admin" },
                  { value: "MANAGER", label: "Manager" },
                  { value: "WAITER", label: "Waiter" },
                  { value: "KITCHEN", label: "Kitchen" },
                  { value: "CASHIER", label: "Cashier" },
                ]}
              />

              {editingUser && (
                <SelectField
                  label="Status"
                  icon={
                    status === "ACTIVE" ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <XCircle size={17} />
                    )
                  }
                  value={status}
                  onChange={(value) =>
                    setStatus(value as UserStatus)
                  }
                  options={[
                    {
                      value: "ACTIVE",
                      label: "Active",
                    },
                    {
                      value: "INACTIVE",
                      label: "Inactive",
                    },
                  ]}
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              All Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all restaurant staff accounts
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                size={30}
                className="animate-spin text-slate-600"
              />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-700">
                No users found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add a user to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              User ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.phone || "No phone number"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleStyle[user.role]}`}
                        >
                          {roleLabel[user.role]}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {user.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={
                              deletingId === user.id
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === user.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
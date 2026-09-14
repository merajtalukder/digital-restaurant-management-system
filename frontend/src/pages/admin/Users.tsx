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
  role: UserRole;
  phone?: string | null;
  status: UserStatus;
}

const roleStyle: Record<UserRole, string> = {
  ADMIN: "bg-violet-50 text-violet-700 border-violet-200",
  MANAGER: "bg-indigo-50 text-indigo-700 border-indigo-200",
  WAITER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  KITCHEN: "bg-cyan-50 text-cyan-700 border-cyan-200",
  CASHIER: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  WAITER: "Waiter",
  KITCHEN: "Kitchen Staff",
  CASHIER: "Cashier",
};

const Users = () => {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("WAITER");

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD USERS FROM DATABASE
  // =========================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (err: any) {
      console.error("Failed to load users:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load users from database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setShowForm(false);

    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("WAITER");

    setError("");
  };

  // =========================
  // ADD USER
  // =========================

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter user name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter password.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/users", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });

      await fetchUsers();

      resetForm();

      alert("User added successfully.");
    } catch (err: any) {
      console.error("Add user error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to add user."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = () => {
    setError(
      "Edit user is not connected to the backend yet."
    );
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = () => {
    setError(
      "Delete user is not connected to the backend yet."
    );
  };

  // =========================
  // STATS
  // =========================

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  return (
    <div className="space-y-5">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
            <UsersIcon size={26} />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Users
            </h2>

            <p className="mt-0.5 text-sm text-white/80">
              Manage restaurant staff and user accounts
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            showForm
              ? resetForm()
              : setShowForm(true)
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
        >
          {showForm ? (
            <X size={18} />
          ) : (
            <Plus size={18} />
          )}

          {showForm ? "Close" : "Add User"}
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <UsersIcon size={19} />
          </div>

          <p className="text-xs font-medium text-gray-500">
            Total Users
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {users.length}
          </p>

        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={19} />
          </div>

          <p className="text-xs font-medium text-gray-500">
            Active
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-600">
            {activeUsers}
          </p>

        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle size={19} />
          </div>

          <p className="text-xs font-medium text-gray-500">
            Inactive
          </p>

          <p className="mt-1 text-xl font-bold text-rose-600">
            {inactiveUsers}
          </p>

        </div>

      </div>

      {/* =========================
          ADD USER FORM
      ========================= */}

      {showForm && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <UserRound size={20} />
            </div>

            <div>

              <h3 className="font-bold text-gray-900">
                Add New User
              </h3>

              <p className="text-xs text-gray-500">
                Enter staff account information
              </p>

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Field
              label="Name"
              icon={<UserRound size={16} />}
              value={name}
              onChange={setName}
              placeholder="e.g. Rahim Ahmed"
            />

            <Field
              label="Email"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="e.g. rahim@restaurant.com"
            />

            <Field
              label="Phone"
              icon={<Phone size={16} />}
              value={phone}
              onChange={setPhone}
              placeholder="e.g. 01700000000"
            />

            <Field
              label="Password"
              icon={<LockKeyhole size={16} />}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
            />

            <SelectField
              label="Role"
              icon={<ShieldCheck size={16} />}
              value={role}
              onChange={(value) =>
                setRole(value as UserRole)
              }
              options={[
                "ADMIN",
                "MANAGER",
                "WAITER",
                "KITCHEN",
                "CASHIER",
              ]}
            />

          </div>

          <div className="mt-5 flex gap-2">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Plus size={16} />
              )}

              {saving
                ? "Saving..."
                : "Save User"}

            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* =========================
          USER LIST
      ========================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>

            <h3 className="font-bold text-gray-900">
              User List
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              {users.length} staff accounts
            </p>

          </div>

          <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            {activeUsers} Active
          </div>

        </div>

        {loading ? (

          <div className="flex items-center justify-center py-16">

            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">

              <Loader2
                size={20}
                className="animate-spin text-emerald-600"
              />

              Loading users...

            </div>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px] text-left">

              <thead className="bg-gray-50/80">

                <tr>

                  {[
                    "User",
                    "Email",
                    "Phone",
                    "Role",
                    "Status",
                    "Actions",
                  ].map((heading) => (

                    <th
                      key={heading}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {heading}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-t border-gray-100 transition hover:bg-emerald-50/30"
                  >

                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 font-bold text-emerald-700">
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-[11px] text-gray-400">
                            ID #{user.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>

                    <td className="px-5 py-3.5">

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          roleStyle[user.role]
                        }`}
                      >
                        {roleLabel[user.role]}
                      </span>

                    </td>

                    <td className="px-5 py-3.5">

                      {user.status === "ACTIVE" ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          Active

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">

                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

                          Inactive

                        </span>

                      )}

                    </td>

                    <td className="px-5 py-3.5">

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={handleEdit}
                          title="Edit user"
                          className="rounded-lg bg-violet-50 p-2 text-violet-600 transition hover:bg-violet-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={handleDelete}
                          title="Delete user"
                          className="rounded-lg bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {!loading && users.length === 0 && (

          <div className="px-5 py-12 text-center">

            <UsersIcon
              className="mx-auto text-gray-300"
              size={40}
            />

            <p className="mt-3 text-sm font-medium text-gray-500">
              No users found
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

// =========================
// FIELD COMPONENT
// =========================

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
};

const Field = ({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) => (
  <div>

    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
      {icon}
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
    />

  </div>
);

// =========================
// SELECT COMPONENT
// =========================

type SelectFieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

const SelectField = ({
  label,
  icon,
  value,
  onChange,
  options,
}: SelectFieldProps) => (
  <div>

    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
      {icon}
      {label}
    </label>

    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
    >

      {options.map((option) => (

        <option
          key={option}
          value={option}
        >
          {option === "KITCHEN"
            ? "Kitchen Staff"
            : option.charAt(0) +
              option.slice(1).toLowerCase()}
        </option>

      ))}

    </select>

  </div>
);

export default Users;
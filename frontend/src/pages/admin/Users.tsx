import { useState } from "react";

type UserRole =
  | "Admin"
  | "Manager"
  | "Waiter"
  | "Kitchen Staff"
  | "Cashier";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: "Active" | "Inactive";
}

const Users = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Waiter");
  const [status, setStatus] = useState<"Active" | "Inactive">(
    "Active"
  );

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Admin User",
      email: "admin@restaurant.com",
      role: "Admin",
      phone: "01700000000",
      status: "Active",
    },
    {
      id: 2,
      name: "Rahim Ahmed",
      email: "rahim@restaurant.com",
      role: "Waiter",
      phone: "01711111111",
      status: "Active",
    },
    {
      id: 3,
      name: "Karim Hasan",
      email: "karim@restaurant.com",
      role: "Kitchen Staff",
      phone: "01722222222",
      status: "Active",
    },
    {
      id: 4,
      name: "Nusrat Jahan",
      email: "nusrat@restaurant.com",
      role: "Cashier",
      phone: "01733333333",
      status: "Inactive",
    },
  ]);

  // =========================
  // SAVE USER
  // =========================

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter user name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (editingId !== null) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: name.trim(),
                email: email.trim(),
                phone,
                role,
                status,
              }
            : user
        )
      );
    } else {
      const newUser: User = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone,
        role,
        status,
      };

      setUsers((currentUsers) => [
        ...currentUsers,
        newUser,
      ]);
    }

    resetForm();
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (user: User) => {
    setEditingId(user.id);

    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.status);

    setShowForm(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id)
    );
  };

  // =========================
  // RESET
  // =========================

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);

    setName("");
    setEmail("");
    setPhone("");
    setRole("Waiter");
    setStatus("Active");
  };

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Users
          </h2>

          <p className="mt-2 text-gray-600">
            Manage restaurant staff and user accounts
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
        >
          {showForm ? "Close" : "+ Add User"}
        </button>
      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-gray-800">
            {editingId !== null
              ? "Edit User"
              : "Add New User"}
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Rahim Ahmed"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="e.g. rahim@restaurant.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="e.g. 01700000000"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {/* Role */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as UserRole)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Waiter">Waiter</option>
                <option value="Kitchen Staff">
                  Kitchen Staff
                </option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>

            {/* Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Active"
                      | "Inactive"
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              >
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* Buttons */}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              {editingId !== null
                ? "Update User"
                : "Save User"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-100 px-5 py-3 font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= USER TABLE ================= */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">
            User List
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Name
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Email
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Phone
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Role
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.phone || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {user.status === "Active" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(user)
                        }
                        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(user.id)
                        }
                        className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
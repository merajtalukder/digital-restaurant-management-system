import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  Clock3,
  CalendarCheck,
  X,
} from "lucide-react";

type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

interface RestaurantTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
}

const API_URL = "http://localhost:3000/tables";

const Tables = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<TableStatus>("AVAILABLE");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<TableStatus | "All">("All");

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load tables.");
      }

      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load tables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTableNumber("");
    setCapacity("");
    setStatus("AVAILABLE");
  };

  const handleSave = async () => {
    if (!tableNumber.trim()) {
      alert("Please enter table number.");
      return;
    }

    if (!capacity || Number(capacity) <= 0) {
      alert("Please enter a valid capacity.");
      return;
    }

    try {
      const tableData = {
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
        status,
      };

      let response;

      if (editingId !== null) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tableData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tableData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save table.");
      }

      await fetchTables();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to save table.");
    }
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setTableNumber(String(table.tableNumber));
    setCapacity(String(table.capacity));
    setStatus(table.status);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete table.");
      }

      await fetchTables();
    } catch (error) {
      console.error(error);
      alert("Failed to delete table.");
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch = String(table.tableNumber)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || table.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalTables = tables.length;
  const availableTables = tables.filter(
    (t) => t.status === "AVAILABLE"
  ).length;
  const occupiedTables = tables.filter(
    (t) => t.status === "OCCUPIED"
  ).length;
  const reservedTables = tables.filter(
    (t) => t.status === "RESERVED"
  ).length;

  const statusConfig = {
    AVAILABLE: {
      label: "Available",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: "bg-emerald-100 text-emerald-600",
      dot: "bg-emerald-500",
    },
    OCCUPIED: {
      label: "Occupied",
      badge: "bg-red-50 text-red-700 ring-red-200",
      icon: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    },
    RESERVED: {
      label: "Reserved",
      badge: "bg-amber-50 text-amber-700 ring-amber-200",
      icon: "bg-amber-100 text-amber-600",
      dot: "bg-amber-500",
    },
  };

  const stats = [
    {
      label: "Total Tables",
      value: totalTables,
      icon: Users,
      style: "bg-slate-100 text-slate-600",
    },
    {
      label: "Available",
      value: availableTables,
      icon: CheckCircle2,
      style: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Occupied",
      value: occupiedTables,
      icon: Clock3,
      style: "bg-red-100 text-red-600",
    },
    {
      label: "Reserved",
      value: reservedTables,
      icon: CalendarCheck,
      style: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tables
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Manage restaurant tables and seating
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5"
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? "Close Form" : "Add Table"}
        </button>
      </div>

      {/* STATS */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.style}`}
                >
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingId !== null ? "Edit Table" : "Add New Table"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {editingId !== null
                  ? "Update table information."
                  : "Create a new restaurant table."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Table Number
              </label>

              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Capacity
              </label>

              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 4"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as TableStatus)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
            >
              {editingId !== null ? "Update Table" : "Save Table"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="grid gap-2.5 md:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table number..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as TableStatus | "All"
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="All">All Tables</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>
      </div>

      {/* LIST HEADER */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Table List
          </h2>

          <p className="text-xs text-slate-400">
            {filteredTables.length} table
            {filteredTables.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* TABLE LIST */}
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center text-sm text-slate-500 shadow-sm">
          Loading tables...
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Users size={22} />
          </div>

          <h3 className="font-semibold text-slate-700">
            No tables found
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables.map((table) => {
            const config = statusConfig[table.status];

            return (
              <div
                key={table.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* TOP */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Table
                    </p>

                    <h3 className="mt-0.5 text-2xl font-extrabold text-slate-800">
                      T-{String(table.tableNumber).padStart(2, "0")}
                    </h3>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.icon}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${config.dot}`}
                    />
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Capacity
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {table.capacity} seats
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(table)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(table.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tables;
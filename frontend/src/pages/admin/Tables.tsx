import { useEffect, useState } from "react";

type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED";

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
  const [status, setStatus] =
    useState<TableStatus>("AVAILABLE");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<TableStatus | "All">("All");

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET TABLES
  // =========================

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

  // =========================
  // SAVE / UPDATE
  // =========================

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
        response = await fetch(
          `${API_URL}/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tableData),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  // =========================
  // EDIT
  // =========================

  const handleEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setTableNumber(String(table.tableNumber));
    setCapacity(String(table.capacity));
    setStatus(table.status);

    // Edit korle form show hobe
    setShowForm(true);

    // Page automatically form-er dike jabe
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this table?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete table.");
      }

      await fetchTables();
    } catch (error) {
      console.error(error);
      alert("Failed to delete table.");
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTableNumber("");
    setCapacity("");
    setStatus("AVAILABLE");
  };

  // =========================
  // FILTER
  // =========================

  const filteredTables = tables.filter((table) => {
    const matchesSearch = String(table.tableNumber)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      table.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClass = (
    tableStatus: TableStatus
  ) => {
    switch (tableStatus) {
      case "AVAILABLE":
        return "bg-green-50 text-green-700 border-green-200";

      case "OCCUPIED":
        return "bg-red-50 text-red-700 border-red-200";

      case "RESERVED":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // =========================
  // STATUS LABEL
  // =========================

  const getStatusLabel = (
    tableStatus: TableStatus
  ) => {
    switch (tableStatus) {
      case "AVAILABLE":
        return "Available";

      case "OCCUPIED":
        return "Occupied";

      case "RESERVED":
        return "Reserved";

      default:
        return tableStatus;
    }
  };

  // =========================
  // STATUS DOT
  // =========================

  const getStatusDot = (
    tableStatus: TableStatus
  ) => {
    switch (tableStatus) {
      case "AVAILABLE":
        return "bg-green-500";

      case "OCCUPIED":
        return "bg-red-500";

      case "RESERVED":
        return "bg-yellow-500";

      default:
        return "bg-gray-500";
    }
  };

  // =========================
  // STATISTICS
  // =========================

  const totalTables = tables.length;

  const availableTables = tables.filter(
    (table) => table.status === "AVAILABLE"
  ).length;

  const occupiedTables = tables.filter(
    (table) => table.status === "OCCUPIED"
  ).length;

  const reservedTables = tables.filter(
    (table) => table.status === "RESERVED"
  ).length;

  return (
    <div className="w-full min-w-0">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Tables
          </h2>

          <p className="mt-2 text-gray-600">
            Manage restaurant tables and seating availability
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
          className="w-full rounded-xl bg-gray-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
        >
          {showForm ? "Close Form" : "+ Add Table"}
        </button>

      </div>

      {/* ================= STATISTICS ================= */}

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">

        {/* Total */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Tables
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-800">
                {totalTables}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
              🍽️
            </div>

          </div>
        </div>

        {/* Available */}

        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Available
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {availableTables}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>

          </div>
        </div>

        {/* Occupied */}

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Occupied
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {occupiedTables}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <span className="h-3 w-3 rounded-full bg-red-500" />
            </div>

          </div>
        </div>

        {/* Reserved */}

        <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Reserved
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {reservedTables}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50">
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
            </div>

          </div>
        </div>

      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId !== null
                  ? "Edit Table"
                  : "Add New Table"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {editingId !== null
                  ? "Update table information."
                  : "Create a new restaurant table."}
              </p>
            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Table Number */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Table Number
              </label>

              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) =>
                  setTableNumber(e.target.value)
                }
                placeholder="e.g. 1"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* Capacity */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Capacity
              </label>

              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) =>
                  setCapacity(e.target.value)
                }
                placeholder="e.g. 4"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
              />
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
                    e.target.value as TableStatus
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
              >
                <option value="AVAILABLE">
                  Available
                </option>

                <option value="OCCUPIED">
                  Occupied
                </option>

                <option value="RESERVED">
                  Reserved
                </option>
              </select>
            </div>

          </div>

          {/* Buttons */}

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              {editingId !== null
                ? "Update Table"
                : "Save Table"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* ================= SEARCH / FILTER ================= */}

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          {/* Search */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search Tables
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search table number..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Filter */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Filter by Status
            </label>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as
                    | TableStatus
                    | "All"
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            >
              <option value="All">
                All Tables
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="OCCUPIED">
                Occupied
              </option>

              <option value="RESERVED">
                Reserved
              </option>
            </select>
          </div>

        </div>

      </div>

      {/* ================= CARD SECTION ================= */}

      <div>

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Table List
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {filteredTables.length} table
              {filteredTables.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center text-gray-500 shadow-sm">
            Loading tables...
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              🍽️
            </div>

            <h3 className="font-semibold text-gray-800">
              No tables found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>

          </div>
        ) : (

          /* RESPONSIVE CARD GRID */

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredTables.map((table) => (

              <div
                key={table.id}
                className="group min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >

                {/* Card Top */}

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-gray-500">
                      Table
                    </p>

                    <h3 className="mt-1 text-3xl font-bold text-gray-800">
                      T-
                      {String(
                        table.tableNumber
                      ).padStart(2, "0")}
                    </h3>

                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      table.status ===
                      "AVAILABLE"
                        ? "bg-green-50"
                        : table.status ===
                          "OCCUPIED"
                        ? "bg-red-50"
                        : "bg-yellow-50"
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusDot(
                        table.status
                      )}`}
                    />
                  </div>

                </div>

                {/* Capacity */}

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                  <span className="text-sm text-gray-500">
                    Capacity
                  </span>

                  <span className="font-semibold text-gray-800">
                    {table.capacity} seats
                  </span>

                </div>

                {/* Status */}

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      table.status
                    )}`}
                  >
                    {getStatusLabel(
                      table.status
                    )}
                  </span>

                </div>

                {/* Actions */}

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(table)
                    }
                    className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(table.id)
                    }
                    className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Tables;
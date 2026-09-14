import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  Plus,
  Utensils,
} from "lucide-react";
import api from "../../api/axios";

const NewOrder = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tables");

      setTables(response.data);
    } catch (error) {
      console.log("Table fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableTables = useMemo(
    () =>
      tables.filter(
        (table) => table.status === "AVAILABLE"
      ),
    [tables]
  );

  const occupiedTables = useMemo(
    () =>
      tables.filter(
        (table) => table.status === "OCCUPIED"
      ),
    [tables]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-lg shadow-emerald-200/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Plus size={20} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-white/75">
                Order Management
              </span>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              New Order
            </h1>

            <p className="mt-1 text-sm text-white/80">
              Select an available table to start a new order.
            </p>
          </div>

          {/* Available count */}
          <div className="flex w-fit items-center gap-3 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/70">
                Available Tables
              </p>

              <p className="text-xl font-bold leading-none">
                {availableTables.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2
                size={18}
                className="text-emerald-500"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Available
              </p>

              <p className="text-lg font-bold text-slate-800">
                {availableTables.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <Clock3
                size={18}
                className="text-violet-500"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Occupied
              </p>

              <p className="text-lg font-bold text-slate-800">
                {occupiedTables.length}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
              <Armchair
                size={18}
                className="text-cyan-500"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total Tables
              </p>

              <p className="text-lg font-bold text-slate-800">
                {tables.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Select a Table
          </h2>

          <p className="text-xs text-slate-500">
            Available tables can be selected for a new order.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading tables...
          </p>
        </div>
      )}

      {/* No Tables */}
      {!loading && tables.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <Armchair
              size={26}
              className="text-emerald-500"
            />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            No Tables Found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            No restaurant tables are available right now.
          </p>
        </div>
      )}

      {/* Tables */}
      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tables.map((table) => {
            const isAvailable =
              table.status === "AVAILABLE";

            const isOccupied =
              table.status === "OCCUPIED";

            return (
              <div
                key={table.id}
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                  isAvailable
                    ? "border-emerald-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/60"
                    : "border-slate-200"
                }`}
              >
                {/* Top accent */}
                <div
                  className={`h-1.5 ${
                    isAvailable
                      ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                      : isOccupied
                      ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      : "bg-slate-300"
                  }`}
                />

                <div className="p-4">
                  {/* Table heading */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          isAvailable
                            ? "bg-emerald-50"
                            : isOccupied
                            ? "bg-violet-50"
                            : "bg-slate-100"
                        }`}
                      >
                        <Utensils
                          size={20}
                          className={
                            isAvailable
                              ? "text-emerald-600"
                              : isOccupied
                              ? "text-violet-600"
                              : "text-slate-500"
                          }
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Restaurant Table
                        </p>

                        <h3 className="text-lg font-bold text-slate-800">
                          Table {table.tableNumber}
                        </h3>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        isAvailable
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isOccupied
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  {/* Status info */}
                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Current Status
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          isAvailable
                            ? "text-emerald-600"
                            : isOccupied
                            ? "text-violet-600"
                            : "text-slate-600"
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    disabled={!isAvailable}
                    onClick={() => {
                      navigate(
                        `/waiter/order/${table.id}`
                      );
                    }}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      isAvailable
                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-200/50 hover:shadow-lg active:scale-[0.98]"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <Plus size={17} />
                        Select Table
                      </>
                    ) : (
                      <>
                        <Clock3 size={16} />
                        Table Unavailable
                      </>
                    )}
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

export default NewOrder;
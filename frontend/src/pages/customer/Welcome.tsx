import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Sparkles,
  Utensils,
} from "lucide-react";

import api from "../../api/axios";

type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

interface RestaurantTable {
  id: number;
  status: TableStatus;
}

const Welcome = () => {
  const [searchParams] = useSearchParams();

  const tableId = searchParams.get("table");

  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTableStatus = async () => {
      if (!tableId) {
        setLoading(false);
        setTable(null);
        return;
      }

      try {
        const response = await api.get("/tables");

        const tables = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        const selectedTable = tables.find(
          (item: RestaurantTable) =>
            Number(item.id) === Number(tableId),
        );

        setTable(selectedTable || null);
      } catch (error) {
        console.error("Failed to check table status:", error);
        setTable(null);
      } finally {
        setLoading(false);
      }
    };

    checkTableStatus();
  }, [tableId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-md items-center justify-center rounded-[28px] bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Loader2
                size={28}
                className="animate-spin text-emerald-500"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Checking table availability
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Please wait a moment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-md items-center justify-center rounded-[28px] bg-white px-6 shadow-sm">
          <div className="w-full text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={38}
                className="text-red-500"
                strokeWidth={2}
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Table Not Found
            </h2>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              This QR code is invalid or the selected table could not
              be found. Please contact restaurant staff.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    table.status === "OCCUPIED" ||
    table.status === "RESERVED"
  ) {
    const isOccupied = table.status === "OCCUPIED";

    return (
      <div className="min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-md items-center justify-center rounded-[28px] bg-white px-5 shadow-sm">
          <div className="w-full text-center">
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
                isOccupied ? "bg-red-50" : "bg-amber-50"
              }`}
            >
              {isOccupied ? (
                <LockKeyhole
                  size={42}
                  className="text-red-500"
                  strokeWidth={2}
                />
              ) : (
                <AlertTriangle
                  size={42}
                  className="text-amber-500"
                  strokeWidth={2}
                />
              )}
            </div>

            <div
              className={`mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                isOccupied
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOccupied
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />

              {isOccupied
                ? "TABLE OCCUPIED"
                : "TABLE RESERVED"}
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              {isOccupied
                ? "Table Occupied"
                : "Table Reserved"}
            </h1>

            <p className="mt-3 text-base font-semibold text-slate-700">
              {isOccupied
                ? "This table is currently occupied."
                : "This table is currently reserved."}
            </p>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isOccupied
                ? "Please choose another available table or contact restaurant staff."
                : "Please wait or contact restaurant staff for an available table."}
            </p>

            <div
              className={`mt-6 rounded-2xl border px-4 py-4 text-left shadow-sm ${
                isOccupied
                  ? "border-red-100 bg-red-50"
                  : "border-amber-100 bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isOccupied
                      ? "bg-red-100"
                      : "bg-amber-100"
                  }`}
                >
                  {isOccupied ? (
                    <LockKeyhole
                      size={16}
                      className="text-red-600"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="text-amber-600"
                    />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-bold ${
                      isOccupied
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}
                  >
                    {isOccupied
                      ? "Table is occupied"
                      : "Table is reserved"}
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      isOccupied
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    Ordering is unavailable for this table right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-sm">
        <div className="shrink-0 px-5 pt-4 sm:px-6 sm:pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 sm:text-xs">
            Restaurant
          </p>

          <h1 className="mt-0.5 text-lg font-bold text-slate-900 sm:text-xl">
            Restaurant POS
          </h1>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
            <CheckCircle2
              size={13}
              className="text-emerald-500"
            />

            <span className="text-[11px] font-semibold text-emerald-600">
              Table is available
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="relative mb-5 flex h-44 w-44 items-center justify-center rounded-full bg-emerald-50 sm:h-52 sm:w-52">
            <div className="absolute h-36 w-36 rounded-full bg-teal-100 sm:h-44 sm:w-44" />

            <div className="absolute right-5 top-5 text-violet-400">
              <Sparkles size={20} />
            </div>

            <div className="absolute bottom-7 left-5 h-3 w-3 rounded-full bg-cyan-400" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg sm:h-32 sm:w-32">
              <div
                className="
                  flex h-20 w-20 items-center justify-center
                  rounded-full
                  bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
                  text-white shadow-md
                  sm:h-24 sm:w-24
                "
              >
                <Utensils
                  size={40}
                  strokeWidth={1.7}
                  className="sm:h-11 sm:w-11"
                />
              </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-emerald-500 sm:text-sm">
            Fresh • Delicious • Simple
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Good Food,
            <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Good Mood.
            </span>
          </h2>

          <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Explore our menu, choose your favorite food and place your
            order directly from your table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
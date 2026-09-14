import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  Utensils,
} from "lucide-react";

import api from "../../api/axios";

interface Table {
  id: number;
  tableNumber: number | string;
  status: string;
}

const Tables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables");

      console.log("API RESPONSE:", response.data);

      setTables(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.log("Error fetching tables:", error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return {
          label: "Available",
          color:
            "text-emerald-700 bg-emerald-50 border-emerald-100",
          icon: CheckCircle2,
        };

      case "OCCUPIED":
        return {
          label: "Occupied",
          color:
            "text-red-700 bg-red-50 border-red-100",
          icon: Clock3,
        };

      case "RESERVED":
        return {
          label: "Reserved",
          color:
            "text-violet-700 bg-violet-50 border-violet-100",
          icon: Clock3,
        };

      default:
        return {
          label: status || "Unknown",
          color:
            "text-gray-600 bg-gray-50 border-gray-100",
          icon: Clock3,
        };
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
              <Armchair size={19} />
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Restaurant Tables
            </h1>
          </div>

          <p className="ml-11 mt-1 text-sm text-gray-500">
            Select an available table to take a customer order.
          </p>
        </div>

        <div className="self-start rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 sm:self-auto">
          {tables.length} Tables
        </div>
      </div>

      {/* Table Grid */}
      {tables.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <Armchair size={25} />
          </div>

          <h2 className="mt-4 font-semibold text-gray-700">
            No tables found
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Restaurant tables will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">

          {tables.map((table) => {
            const status = getStatusConfig(
              table.status
            );

            const StatusIcon = status.icon;

            const isOccupied =
              table.status === "OCCUPIED";

            return (
              <div
                key={table.id}
                className="
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  hover:shadow-md
                "
              >

                {/* Table Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-emerald-50
                      to-cyan-50
                      text-emerald-600
                    "
                  >
                    <Utensils size={20} />
                  </div>

                  {/* Database ID intentionally hidden */}
                </div>

                {/* Actual Table Number */}
                <h2 className="mt-3 text-lg font-bold text-gray-800">
                  Table {table.tableNumber}
                </h2>

                {/* Status */}
                <div className="mt-2">
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      ${status.color}
                    `}
                  >
                    <StatusIcon size={13} />
                    {status.label}
                  </span>
                </div>

                {/* Action */}
                <button
                  onClick={() =>
                    navigate(
                      `/waiter/order/${table.id}`
                    )
                  }
                  disabled={isOccupied}
                  className={`
                    mt-4
                    w-full
                    rounded-xl
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    ${
                      isOccupied
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-sm hover:brightness-105 hover:shadow-md"
                    }
                  `}
                >
                  {isOccupied
                    ? "Table Occupied"
                    : "Take Order"}
                </button>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default Tables;
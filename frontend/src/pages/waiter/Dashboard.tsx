import { useEffect, useState } from "react";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  Utensils,
} from "lucide-react";

import api from "../../api/axios";

interface Table {
  id: number;
  tableNumber?: number;
  status?: string;
}

interface Order {
  id: number;
  status: string;
  tableId?: number;
  table?: {
    tableNumber?: number;
  };
  createdAt: string;
}

const Dashboard = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tablesResponse, ordersResponse] = await Promise.all([
          api.get("/tables"),
          api.get("/orders"),
        ]);

        setTables(tablesResponse.data);
        setOrders(ordersResponse.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const assignedTables = tables.length;

  const activeOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PREPARING"
  ).length;

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  ).length;

  const servedToday = orders.filter(
    (order) => order.status === "SERVED"
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Assigned Tables",
      value: assignedTables,
      icon: Armchair,
      box: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Active Orders",
      value: activeOrders,
      icon: Clock3,
      box: "bg-violet-50 text-violet-600",
    },
    {
      title: "Ready Orders",
      value: readyOrders,
      icon: CheckCircle2,
      box: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Served Today",
      value: servedToday,
      icon: ShoppingBag,
      box: "bg-teal-50 text-teal-600",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "SERVED":
        return "bg-violet-50 text-violet-700 border-violet-100";

      case "PREPARING":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-5 sm:p-6 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Utensils size={17} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Waiter Dashboard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, Waiter 👋
          </h1>

          <p className="text-sm text-white/80 mt-1">
            Manage tables and customer orders from here.
          </p>
        </div>

        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-16 -bottom-16 w-36 h-36 rounded-full bg-white/10" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.box}`}
                >
                  <Icon size={20} />
                </div>

                <span className="text-2xl font-bold text-gray-800">
                  {item.value}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-3 font-medium">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">
              Recent Orders
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Latest customer orders
            </p>
          </div>

          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <ShoppingBag size={20} />
            </div>

            <p className="text-sm text-gray-500 mt-3">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">

              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Order
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Table
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-sm text-gray-800">
                        #{order.id}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.table?.tableNumber
                        ? `Table ${order.table.tableNumber}`
                        : order.tableId
                          ? `Table ${order.tableId}`
                          : "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
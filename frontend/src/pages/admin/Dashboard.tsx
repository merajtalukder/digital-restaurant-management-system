import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Wallet,
  Table2,
  Clock3,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
}

interface RestaurantTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersRes, tablesRes] = await Promise.all([
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/tables`),
        ]);

        if (!ordersRes.ok || !tablesRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        setOrders(await ordersRes.json());
        setTables(await tablesRes.json());
      } catch (err) {
        console.error(err);
        setError(
          "Could not load dashboard data. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const today = new Date();

  const todaysOrders = orders.filter((order) => {
    const date = new Date(order.createdAt);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });

  const todaysSales = todaysOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  const availableTables = tables.filter(
    (table) => table.status === "AVAILABLE"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: loading ? "..." : todaysOrders.length,
      description: "Orders today",
      icon: ShoppingBag,
      style: "from-emerald-500 to-teal-500",
    },
    {
      title: "Today's Sales",
      value: loading ? "..." : `৳${todaysSales.toFixed(2)}`,
      description: "Total sales today",
      icon: Wallet,
      style: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Available Tables",
      value: loading ? "..." : availableTables,
      description: "Tables available",
      icon: Table2,
      style: "from-cyan-500 to-blue-500",
    },
    {
      title: "Pending Orders",
      value: loading ? "..." : pendingOrders,
      description: "Waiting for preparation",
      icon: Clock3,
      style: "from-amber-500 to-orange-500",
    },
  ];

  const statusStyle = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-50 text-amber-600",
      PREPARING: "bg-violet-50 text-violet-600",
      READY: "bg-cyan-50 text-cyan-600",
      SERVED: "bg-emerald-50 text-emerald-600",
      COMPLETED: "bg-emerald-50 text-emerald-700",
      CANCELLED: "bg-red-50 text-red-600",
    };

    return styles[status] || "bg-slate-50 text-slate-500";
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Restaurant POS overview
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-slate-800 sm:text-2xl">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.style} text-white shadow-sm`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Recent Orders
              </h2>
              <p className="text-[11px] text-slate-400">
                Latest restaurant orders
              </p>
            </div>

            <ShoppingBag size={19} className="text-emerald-500" />
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {["Order", "Amount", "Status", "Date"].map((title) => (
                      <th
                        key={title}
                        className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-700">
                        {order.orderNumber}
                      </td>

                      <td className="px-5 py-3.5 text-sm font-bold text-emerald-600">
                        ৳{Number(order.totalAmount).toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleString()}
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
};

export default Dashboard;
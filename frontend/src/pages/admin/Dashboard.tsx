import { useEffect, useState } from "react";

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

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersResponse, tablesResponse] =
          await Promise.all([
            fetch(`${API_URL}/orders`),
            fetch(`${API_URL}/tables`),
          ]);

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders.");
        }

        if (!tablesResponse.ok) {
          throw new Error("Failed to fetch tables.");
        }

        const ordersData = await ordersResponse.json();
        const tablesData = await tablesResponse.json();

        setOrders(ordersData);
        setTables(tablesData);
      } catch (error) {
        console.error(error);

        setError(
          "Could not load dashboard data. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================
  // TODAY'S ORDERS
  // =========================

  const today = new Date();

  const todaysOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    );
  });

  // =========================
  // TODAY'S SALES
  // =========================

  const todaysSales = todaysOrders.reduce(
    (total, order) =>
      total + Number(order.totalAmount),
    0
  );

  // =========================
  // AVAILABLE TABLES
  // =========================

  const availableTables = tables.filter(
    (table) => table.status === "AVAILABLE"
  ).length;

  // =========================
  // PENDING ORDERS
  // =========================

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  // =========================
  // STATS
  // =========================

  const stats = [
    {
      title: "Total Orders",
      value: loading ? "..." : todaysOrders.length.toString(),
      description: "Orders today",
    },
    {
      title: "Today's Sales",
      value: loading
        ? "..."
        : `৳${todaysSales.toFixed(2)}`,
      description: "Total sales today",
    },
    {
      title: "Available Tables",
      value: loading
        ? "..."
        : availableTables.toString(),
      description: "Tables available",
    },
    {
      title: "Pending Orders",
      value: loading
        ? "..."
        : pendingOrders.toString(),
      description: "Waiting for preparation",
    },
  ];

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Welcome to Restaurant POS Management System
        </p>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-medium text-gray-500">
              {stat.title}
            </h3>

            <p className="mt-3 text-3xl font-bold text-gray-800">
              {stat.value}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* ================= RECENT ORDERS ================= */}

      <div className="mt-8 rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Recent Orders
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Order
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {order.orderNumber}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ৳
                      {Number(
                        order.totalAmount
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
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
import { useEffect, useState } from "react";
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

  // Total tables
  const assignedTables = tables.length;

  // Active orders
  const activeOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PREPARING"
  ).length;

  // Ready orders
  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  ).length;

  // Served orders
  const servedToday = orders.filter(
    (order) => order.status === "SERVED"
  ).length;

  // Recent orders
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
      color: "bg-blue-500",
    },
    {
      title: "Active Orders",
      value: activeOrders,
      color: "bg-yellow-500",
    },
    {
      title: "Ready Orders",
      value: readyOrders,
      color: "bg-green-500",
    },
    {
      title: "Served Today",
      value: servedToday,
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold">
          Welcome, Waiter 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your assigned tables and customer orders.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow p-5"
          >
            <div
              className={`w-12 h-12 rounded-lg ${item.color}`}
            />

            <h2 className="text-gray-500 mt-4">
              {item.title}
            </h2>

            <p className="text-3xl font-bold mt-2">
              {item.value}
            </p>
          </div>
        ))}

      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b p-5">
          <h2 className="text-xl font-semibold">
            Recent Orders
          </h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">
                    Order
                  </th>

                  <th className="text-left p-4">
                    Table
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b"
                  >

                    <td className="p-4 font-medium">
                      #{order.id}
                    </td>

                    <td className="p-4">
                      {order.table?.tableNumber
                        ? `Table ${order.table.tableNumber}`
                        : order.tableId
                          ? `Table ${order.tableId}`
                          : "N/A"}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.status === "READY"
                            ? "bg-green-100 text-green-700"
                            : order.status === "SERVED"
                              ? "bg-purple-100 text-purple-700"
                              : order.status === "PREPARING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
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
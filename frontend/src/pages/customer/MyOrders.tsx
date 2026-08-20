import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

interface MenuItem {
  id: number;
  name: string;
}

interface RestaurantTable {
  id: number;
  tableNumber: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  menuItem: MenuItem;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
  table: RestaurantTable;
  orderItems: OrderItem[];
}

const MyOrders = () => {
  const { customerTableNumber } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders");

        console.log("All Orders:", response.data);
        console.log(
          "Current Customer Table:",
          customerTableNumber
        );

        // =========================
        // FILTER BY CURRENT TABLE
        // =========================

        const tableOrders = response.data.filter(
          (order: Order) =>
            Number(order.table?.tableNumber) ===
            Number(customerTableNumber)
        );

        console.log("Current Table Orders:", tableOrders);

        setOrders(tableOrders);
      } catch (err: any) {
        console.error(
          "Failed to load orders:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when table is known
    if (customerTableNumber) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [customerTableNumber]);

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "PREPARING":
        return "bg-orange-100 text-orange-600";

      case "READY":
        return "bg-blue-100 text-blue-600";

      case "SERVED":
        return "bg-green-100 text-green-600";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =========================
  // STATUS TEXT
  // =========================

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Order Placed";

      case "PREPARING":
        return "Preparing";

      case "READY":
        return "Ready";

      case "SERVED":
        return "Served";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  // =========================
  // NO TABLE SELECTED
  // =========================

  if (!customerTableNumber) {
    return (
      <div className="py-10 text-center">

        <div className="text-5xl mb-4">
          🪑
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          Table Not Selected
        </h1>

        <p className="text-gray-500 mt-2">
          Please enter through your table's QR code.
        </p>

      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="py-10 text-center">

        <p className="text-gray-500">
          Loading your orders...
        </p>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="py-10">

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5 text-center">
          {error}
        </div>

      </div>
    );
  }

  // =========================
  // NO ORDERS
  // =========================

  if (orders.length === 0) {
    return (
      <div className="py-10 text-center">

        <div className="text-5xl mb-4">
          📦
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          No Orders Yet
        </h1>

        <p className="text-gray-500 mt-2">
          No orders found for Table{" "}
          {customerTableNumber}.
        </p>

        <Link
          to="/customer/menu"
          className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Browse Menu
        </Link>

      </div>
    );
  }

  // =========================
  // ORDERS
  // =========================

  return (
    <div className="py-6">

      {/* =========================
          TITLE
      ========================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          My Orders
        </h1>

        <p className="text-gray-500 mt-1">
          Table {customerTableNumber} • View and track your recent orders.
        </p>

      </div>

      {/* =========================
          ORDERS
      ========================= */}

      <div className="space-y-5">

        {orders.map((order) => (

          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border p-5"
          >

            {/* =========================
                TOP
            ========================= */}

            <div className="flex justify-between items-start gap-4">

              <div>

                <h2 className="font-bold text-lg text-gray-800">
                  {order.orderNumber}
                </h2>

                <p className="text-gray-400 text-xs mt-1">
                  Order ID: #{order.id}
                </p>

              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>

            </div>

            {/* =========================
                ITEMS
            ========================= */}

            <div className="mt-4 space-y-1">

              {order.orderItems.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between text-sm text-gray-600"
                >

                  <span>
                    {item.menuItem?.name} ×{" "}
                    {item.quantity}
                  </span>

                  <span>
                    ৳
                    {Number(
                      item.subtotal
                    ).toFixed(2)}
                  </span>

                </div>

              ))}

            </div>

            {/* =========================
                BOTTOM
            ========================= */}

            <div className="flex justify-between items-center mt-5 pt-4 border-t">

              <div>

                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="font-bold text-lg text-orange-500">
                  ৳
                  {Number(
                    order.totalAmount
                  ).toFixed(2)}
                </p>

              </div>

              {/* TRACK */}

              <Link
                to={`/customer/tracking/${order.id}`}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
              >
                Track Order
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default MyOrders;
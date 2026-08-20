import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

type OrderType = "WAITER" | "QR";

type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

type FoodType = "INSTANT" | "COOKED";

interface MenuItem {
  id: number;
  name: string;
  price: string | number;
  foodType: FoodType;
}

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
}

interface Waiter {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  menuItem: MenuItem;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: string | number;
  table: Table;
  waiter: Waiter;
  orderItems: OrderItem[];
  createdAt: string;
}

const Kitchen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/orders`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data: Order[] = await response.json();

      setOrders(data);
    } catch (error) {
      console.error(error);

      setError(
        "Could not load kitchen orders. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ORDERS
  // =========================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    id: number,
    status: OrderStatus
  ) => {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `${API_URL}/orders/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status.");
      }

      const updatedOrder: Order =
        await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
        )
      );
    } catch (error) {
      console.error(error);

      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // NEXT STATUS
  // =========================

  const getNextStatus = (
    status: OrderStatus
  ): OrderStatus | null => {
    switch (status) {
      case "PENDING":
        return "PREPARING";

      case "PREPARING":
        return "READY";

      case "READY":
        return "SERVED";

      default:
        return null;
    }
  };

  // =========================
  // STATUS LABEL
  // =========================

  const getStatusText = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "PENDING":
        return "Pending";

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
  // STATUS STYLES
  // =========================

  const getStatusStyle = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "PENDING":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          border: "border-l-amber-400",
        };

      case "PREPARING":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          border: "border-l-blue-500",
        };

      case "READY":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          border: "border-l-emerald-500",
        };

      default:
        return {
          badge: "bg-gray-50 text-gray-600 border-gray-200",
          dot: "bg-gray-400",
          border: "border-l-gray-400",
        };
    }
  };

  // =========================
  // ORDER TYPE
  // =========================

  const getOrderTypeText = (
    type: OrderType
  ) => {
    return type === "WAITER"
      ? "Waiter"
      : "QR Order";
  };

  // =========================
  // FOOD TYPE
  // =========================

  const getFoodTypeText = (
    foodType: FoodType
  ) => {
    return foodType === "COOKED"
      ? "Have to Cook"
      : "Instant";
  };

  const getFoodTypeStyle = (
    foodType: FoodType
  ) => {
    return foodType === "COOKED"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-gray-50 text-gray-600 border-gray-200";
  };

  // =========================
  // TABLE NUMBER
  // =========================

  const getTableNumber = (
    table?: Table
  ) => {
    if (!table) return "N/A";

    return `T-${String(
      table.tableNumber
    ).padStart(2, "0")}`;
  };

  // =========================
  // TIME
  // =========================

  const formatTime = (
    date: string
  ) => {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // FILTER ORDERS
  // =========================

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  );

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  const activeOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PREPARING" ||
      order.status === "READY"
  );

  // =========================
  // ORDER CARD
  // =========================

  const renderOrderCard = (
    order: Order
  ) => {
    const nextStatus = getNextStatus(
      order.status
    );

    const statusStyle =
      getStatusStyle(order.status);

    return (
      <div
        key={order.id}
        className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 bg-white shadow-sm transition hover:shadow-md ${statusStyle.border}`}
      >
        {/* ================= HEADER ================= */}

        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {order.orderNumber}
                </h3>

                <span className="text-xs text-gray-400">
                  {formatTime(order.createdAt)}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {getTableNumber(order.table)}
                </span>

                <span>•</span>

                <span>
                  {getOrderTypeText(
                    order.orderType
                  )}
                </span>
              </div>

              {order.customerName && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  {order.customerName}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle.badge}`}
            >
              <span
                className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
              />

              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* ================= ITEMS ================= */}

        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Order Items
            </p>

            <span className="text-xs text-gray-400">
              {order.orderItems.length}{" "}
              {order.orderItems.length === 1
                ? "item"
                : "items"}
            </span>
          </div>

          <div className="space-y-2">
            {order.orderItems.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.menuItem.name}
                    </p>

                    <span
                      className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${getFoodTypeStyle(
                        item.menuItem.foodType
                      )}`}
                    >
                      {getFoodTypeText(
                        item.menuItem.foodType
                      )}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center justify-center rounded-md bg-white px-2.5 py-1.5 shadow-sm">
                    <span className="text-sm font-bold text-gray-900">
                      × {item.quantity}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* ================= ACTION ================= */}

        {nextStatus && (
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              disabled={
                updatingId === order.id
              }
              onClick={() =>
                updateStatus(
                  order.id,
                  nextStatus
                )
              }
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                order.status === "PENDING"
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : order.status ===
                    "PREPARING"
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {updatingId === order.id
                ? "Updating..."
                : order.status === "PENDING"
                ? "Start Preparing"
                : order.status ===
                  "PREPARING"
                ? "Mark as Ready"
                : "Mark as Served"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // =========================
  // EMPTY STATE
  // =========================

  const emptyState = (
    message: string
  ) => (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
        ✓
      </div>

      <p className="text-sm font-medium text-gray-500">
        {message}
      </p>
    </div>
  );

  // =========================
  // COLUMN
  // =========================

  const renderColumn = (
    title: string,
    count: number,
    orders: Order[],
    color: string,
    message: string
  ) => (
    <section className="min-w-0">
      {/* Column Header */}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${color}`}
          />

          <h3 className="text-base font-bold text-gray-900">
            {title}
          </h3>
        </div>

        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-bold text-gray-600">
          {count}
        </span>
      </div>

      {/* Cards */}

      <div className="space-y-3">
        {orders.length > 0
          ? orders.map(renderOrderCard)
          : emptyState(message)}
      </div>
    </section>
  );

  // =========================
  // RETURN
  // =========================

  return (
    <div className="w-full min-w-0">
      {/* ================= HEADER ================= */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Kitchen Display
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage active orders and food preparation
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="w-fit rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchOrders}
            className="shrink-0 font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Pending
            </p>

            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {pendingOrders.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Preparing
            </p>

            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {preparingOrders.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Ready
            </p>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {readyOrders.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Active Orders
            </p>

            <span className="h-2 w-2 rounded-full bg-gray-900" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {activeOrders.length}
          </p>
        </div>
      </div>

      {/* ================= LOADING ================= */}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

          <p className="text-sm text-gray-500">
            Loading kitchen orders...
          </p>
        </div>
      ) : (
        /* ================= KITCHEN BOARD ================= */

        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          {/* Pending */}

          {renderColumn(
            "Pending",
            pendingOrders.length,
            pendingOrders,
            "bg-amber-500",
            "No pending orders"
          )}

          {/* Preparing */}

          {renderColumn(
            "Preparing",
            preparingOrders.length,
            preparingOrders,
            "bg-blue-500",
            "No orders preparing"
          )}

          {/* Ready */}

          {renderColumn(
            "Ready",
            readyOrders.length,
            readyOrders,
            "bg-emerald-500",
            "No ready orders"
          )}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
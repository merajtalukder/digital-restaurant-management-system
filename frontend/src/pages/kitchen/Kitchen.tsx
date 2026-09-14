import { useEffect, useState } from "react";
import {
  ChefHat,
  Clock3,
  CheckCircle2,
  Utensils,
  RefreshCw,
  ArrowRight,
  MessageSquareText,
  AlertCircle,
} from "lucide-react";

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

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  specialInstructions?: string | null;
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
  orderItems: OrderItem[];
  createdAt: string;
}

const statusInfo: Record<
  OrderStatus,
  {
    label: string;
    badge: string;
    dot: string;
    border: string;
  }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    border: "border-l-amber-400",
  },
  PREPARING: {
    label: "Preparing",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    border: "border-l-violet-500",
  },
  READY: {
    label: "Ready",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    border: "border-l-emerald-500",
  },
  SERVED: {
    label: "Served",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    border: "border-l-slate-400",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    border: "border-l-slate-400",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
    border: "border-l-red-400",
  },
};

const Kitchen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/orders`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: Order[] = await response.json();

      setOrders(data);
    } catch (err) {
      console.error(err);

      setError(
        "Could not load kitchen orders. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    id: number,
    status: OrderStatus
  ) => {
    try {
      setUpdatingId(id);

      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder: Order = await response.json();

      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? { ...order, ...updatedOrder }
            : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (
    status: OrderStatus
  ): OrderStatus | null => {
    if (status === "PENDING") return "PREPARING";
    if (status === "PREPARING") return "READY";
    if (status === "READY") return "SERVED";

    return null;
  };

  const getTableNumber = (table?: Table) =>
    table
      ? `T-${String(table.tableNumber).padStart(2, "0")}`
      : "N/A";

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getFoodType = (foodType: FoodType) =>
    foodType === "COOKED" ? "Have to Cook" : "Instant";

  const getFoodStyle = (foodType: FoodType) =>
    foodType === "COOKED"
      ? "bg-violet-50 text-violet-700 border-violet-200"
      : "bg-cyan-50 text-cyan-700 border-cyan-200";

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  );

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  const activeOrders = orders.filter((order) =>
    ["PENDING", "PREPARING", "READY"].includes(order.status)
  );

  const renderSpecialInstructions = (
    instructions?: string | null
  ) => {
    const text = instructions?.trim();

    if (!text) {
      return null;
    }

    const instructionParts = text
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    return (
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <MessageSquareText
            size={12}
            className="shrink-0 text-amber-600"
          />

          <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700">
            Special Instructions
          </span>
        </div>

        <div className="space-y-1">
          {instructionParts.length > 0 ? (
            instructionParts.map((instruction, index) => (
              <div
                key={`${instruction}-${index}`}
                className="flex items-start gap-1.5 text-[10px] font-medium leading-relaxed text-amber-900"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                <span>{instruction}</span>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-amber-900">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderOrderCard = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    const info = statusInfo[order.status];

    const customizedItemCount = order.orderItems.filter(
      (item) => item.specialInstructions?.trim()
    ).length;

    return (
      <div
        key={order.id}
        className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${info.border}`}
      >
        {/* Header */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
                  <ChefHat size={16} />
                </span>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {order.orderNumber}
                  </h3>

                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock3 size={11} />
                    {formatTime(order.createdAt)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  {getTableNumber(order.table)}
                </span>

                <span className="rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700">
                  {order.orderType === "WAITER"
                    ? "Waiter"
                    : "QR Order"}
                </span>

                {customizedItemCount > 0 && (
                  <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                    <MessageSquareText size={11} />
                    {customizedItemCount} customized
                  </span>
                )}
              </div>

              {order.customerName && (
                <p className="mt-2 truncate text-xs text-slate-500">
                  Customer: {order.customerName}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${info.badge}`}
            >
              <span
                className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${info.dot}`}
              />

              {info.label}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Utensils
                size={13}
                className="text-emerald-500"
              />

              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Items
              </span>
            </div>

            <span className="text-[11px] font-medium text-slate-400">
              {order.orderItems.length}{" "}
              {order.orderItems.length === 1
                ? "item"
                : "items"}
            </span>
          </div>

          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-slate-50 p-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {item.menuItem.name}
                  </p>

                  <span
                    className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getFoodStyle(
                      item.menuItem.foodType
                    )}`}
                  >
                    {getFoodType(item.menuItem.foodType)}
                  </span>
                </div>

                <span className="flex h-7 min-w-9 shrink-0 items-center justify-center rounded-lg bg-white px-2 text-xs font-bold text-slate-800 shadow-sm">
                  × {item.quantity}
                </span>
              </div>

              {renderSpecialInstructions(
                item.specialInstructions
              )}
            </div>
          ))}
        </div>

        {/* Kitchen Notice */}
        {customizedItemCount > 0 && (
          <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-[10px] font-medium leading-relaxed text-amber-800">
              Please check the special instructions before preparing
              customized items.
            </p>
          </div>
        )}

        {/* Action */}
        {nextStatus && (
          <div className="border-t border-slate-100 p-3">
            <button
              type="button"
              disabled={updatingId === order.id}
              onClick={() =>
                updateStatus(order.id, nextStatus)
              }
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                order.status === "READY"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              }`}
            >
              {updatingId === order.id ? (
                <>
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />
                  Updating...
                </>
              ) : (
                <>
                  {order.status === "PENDING"
                    ? "Start Preparing"
                    : order.status === "PREPARING"
                    ? "Mark as Ready"
                    : "Mark as Served"}

                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const EmptyState = ({ text }: { text: string }) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 size={22} />
      </div>

      <p className="text-xs font-medium text-slate-400">
        {text}
      </p>
    </div>
  );

  const renderColumn = (
    title: string,
    count: number,
    columnOrders: Order[],
    dot: string,
    icon: React.ReactNode,
    emptyText: string
  ) => (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${dot}`}
          />

          <div className="flex items-center gap-1.5">
            {icon}

            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>
          </div>
        </div>

        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-bold text-slate-600">
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {columnOrders.length ? (
          columnOrders.map(renderOrderCard)
        ) : (
          <EmptyState text={emptyText} />
        )}
      </div>
    </section>
  );

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-sm">
              <ChefHat size={20} />
            </span>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Kitchen
              </h2>

              <p className="text-xs text-slate-500">
                Manage food preparation and order status
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchOrders}
            className="shrink-0 font-bold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Pending",
            value: pendingOrders.length,
            icon: <Clock3 size={16} />,
            box: "bg-amber-50 text-amber-600",
          },
          {
            label: "Preparing",
            value: preparingOrders.length,
            icon: <ChefHat size={16} />,
            box: "bg-violet-50 text-violet-600",
          },
          {
            label: "Ready",
            value: readyOrders.length,
            icon: <CheckCircle2 size={16} />,
            box: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Active Orders",
            value: activeOrders.length,
            icon: <Utensils size={16} />,
            box: "bg-cyan-50 text-cyan-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">
                {stat.label}
              </p>

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.box}`}
              >
                {stat.icon}
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <RefreshCw
            size={28}
            className="mx-auto mb-3 animate-spin text-emerald-500"
          />

          <p className="text-xs font-medium text-slate-500">
            Loading kitchen orders...
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          {renderColumn(
            "Pending",
            pendingOrders.length,
            pendingOrders,
            "bg-amber-500",
            <Clock3
              size={14}
              className="text-amber-500"
            />,
            "No pending orders"
          )}

          {renderColumn(
            "Preparing",
            preparingOrders.length,
            preparingOrders,
            "bg-violet-500",
            <ChefHat
              size={14}
              className="text-violet-500"
            />,
            "No orders preparing"
          )}

          {renderColumn(
            "Ready",
            readyOrders.length,
            readyOrders,
            "bg-emerald-500",
            <CheckCircle2
              size={14}
              className="text-emerald-500"
            />,
            "No ready orders"
          )}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
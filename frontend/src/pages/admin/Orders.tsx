import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  X,
  CreditCard,
  ShoppingBag,
  Clock3,
  ChefHat,
  CheckCircle2,
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

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface MenuItem {
  id: number;
  name: string;
  price: string | number;
}

interface Table {
  id: number;
  tableNumber: number;
}

interface Waiter {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: string | number;
  menuItem: MenuItem;
}

interface Payment {
  id: number;
  method: string;
  status: PaymentStatus;
  amount: string | number;
  transactionId?: string | null;
}

interface Order {
  id: number;
  customerName?: string | null;
  orderType: OrderType;
  tableId: number;
  waiterId?: number | null;
  totalAmount: string | number;
  status: OrderStatus;
  table?: Table;
  waiter?: Waiter | null;
  orderItems: OrderItem[];
  payment?: Payment | null;
}

const statusOptions: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | OrderType>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | OrderStatus>("ALL");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, {
        status: newStatus,
      });

      await fetchOrders();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order status.");
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const text = search.toLowerCase();

    const matchesSearch =
      order.id.toString().includes(text) ||
      order.table?.tableNumber?.toString().includes(text) ||
      order.customerName?.toLowerCase().includes(text);

    const matchesType =
      typeFilter === "ALL" || order.orderType === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const preparingOrders = orders.filter(
    (o) => o.status === "PREPARING"
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status === "COMPLETED"
  ).length;

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

  const getStatusClass = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
      PREPARING: "bg-blue-50 text-blue-700 ring-blue-200",
      READY: "bg-violet-50 text-violet-700 ring-violet-200",
      SERVED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      CANCELLED: "bg-red-50 text-red-700 ring-red-200",
    };

    return styles[status];
  };

  const getPaymentClass = (status?: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
      FAILED: "bg-red-50 text-red-700 ring-red-200",
      REFUNDED: "bg-violet-50 text-violet-700 ring-violet-200",
    };

    return status
      ? styles[status]
      : "bg-gray-50 text-gray-600 ring-gray-200";
  };

  const statCards = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock3,
      iconClass: "bg-amber-100 text-amber-600",
    },
    {
      label: "Preparing",
      value: preparingOrders,
      icon: ChefHat,
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: CheckCircle2,
      iconClass: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Orders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage restaurant orders
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search order, table, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "ALL" | OrderType)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">All Types</option>
            <option value="WAITER">Waiter</option>
            <option value="QR">QR</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | OrderStatus)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Order",
                  "Table",
                  "Type",
                  "Items",
                  "Total",
                  "Status",
                  "Payment",
                  "Actions",
                ].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw
                        size={22}
                        className="animate-spin text-emerald-500"
                      />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-emerald-50/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">
                        #{order.id}
                      </span>

                      {order.customerName && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {order.customerName}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-700">
                      Table {order.table?.tableNumber ?? order.tableId}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          order.orderType === "QR"
                            ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                            : "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
                        }`}
                      >
                        {order.orderType}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="max-w-[220px]">
                        {order.orderItems?.slice(0, 2).map((item) => (
                          <p
                            key={item.id}
                            className="truncate text-sm text-slate-600"
                          >
                            {item.menuItem?.name} × {item.quantity}
                          </p>
                        ))}

                        {order.orderItems?.length > 2 && (
                          <p className="text-xs font-medium text-slate-400">
                            +{order.orderItems.length - 2} more
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">
                        ৳{Number(order.totalAmount).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getPaymentClass(
                            order.payment?.status
                          )}`}
                        >
                          {order.payment?.status || "No Payment"}
                        </span>

                        {order.payment?.method && (
                          <span className="text-[11px] text-slate-400">
                            {order.payment.method}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="View Order"
                          className="rounded-lg bg-violet-50 p-2 text-violet-600 transition hover:bg-violet-100"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => deleteOrder(order.id)}
                          title="Delete Order"
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-400">
                  Order details
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* BASIC INFO */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  [
                    "Table",
                    `Table ${
                      selectedOrder.table?.tableNumber ??
                      selectedOrder.tableId
                    }`,
                  ],
                  ["Type", selectedOrder.orderType],
                  [
                    "Customer",
                    selectedOrder.customerName || "Guest",
                  ],
                  [
                    "Waiter",
                    selectedOrder.waiter?.name || "N/A",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-700">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ITEMS */}
              <section>
                <h3 className="mb-2 text-sm font-bold text-slate-800">
                  Ordered Items
                </h3>

                <div className="overflow-hidden rounded-xl border border-slate-100">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {item.menuItem?.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          ৳{Number(item.price).toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-slate-800">
                        ৳
                        {(
                          Number(item.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* TOTAL */}
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4">
                <span className="text-sm font-semibold text-slate-600">
                  Total Amount
                </span>

                <span className="text-xl font-extrabold text-emerald-700">
                  ৳{Number(selectedOrder.totalAmount).toFixed(2)}
                </span>
              </div>

              {/* PAYMENT */}
              <section className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                    <CreditCard size={16} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Payment Information
                  </h3>
                </div>

                {selectedOrder.payment ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Info
                      label="Status"
                      value={
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getPaymentClass(
                            selectedOrder.payment.status
                          )}`}
                        >
                          {selectedOrder.payment.status}
                        </span>
                      }
                    />

                    <Info
                      label="Method"
                      value={selectedOrder.payment.method}
                    />

                    <Info
                      label="Amount"
                      value={`৳${Number(
                        selectedOrder.payment.amount
                      ).toFixed(2)}`}
                    />

                    <Info
                      label="Transaction ID"
                      value={
                        selectedOrder.payment.transactionId || "N/A"
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No payment record found.
                  </p>
                )}
              </section>

              {/* STATUS */}
              <section>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Update Order Status
                </label>

                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      selectedOrder.id,
                      e.target.value as OrderStatus
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </section>

              {/* DELETE */}
              <button
                onClick={() => deleteOrder(selectedOrder.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <Trash2 size={16} />
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <div className="mt-1 text-sm font-semibold text-slate-700">
      {value}
    </div>
  </div>
);

export default Orders;
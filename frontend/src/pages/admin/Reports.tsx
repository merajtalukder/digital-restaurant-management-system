import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ShoppingBag,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  Users,
  QrCode,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type ReportPeriod = "Today" | "This Week" | "This Month";
type OrderType = "WAITER" | "QR";

type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

interface MenuItem {
  id: number;
  name: string;
  price: string | number;
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

interface Payment {
  id: number;
  method: string;
  status: PaymentStatus;
  amount: string | number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: string | number;
  table?: Table | null;
  waiter?: Waiter | null;
  orderItems: OrderItem[];
  payment?: Payment | null;
  createdAt: string;
}

const Reports = () => {
  const [period, setPeriod] = useState<ReportPeriod>("Today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        "Could not load report data. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (period === "Today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (period === "This Week") {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const difference = day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() - difference
        );
        startOfWeek.setHours(0, 0, 0, 0);

        return orderDate >= startOfWeek;
      }

      if (period === "This Month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [orders, period]);

  const completedOrders = filteredOrders.filter(
    (order) => order.status === "COMPLETED"
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "CANCELLED"
  );

  const totalSales = completedOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  const totalOrders = filteredOrders.length;

  const averageOrder =
    completedOrders.length > 0
      ? totalSales / completedOrders.length
      : 0;

  const paidOrders = filteredOrders.filter(
    (order) => order.payment?.status === "PAID"
  );

  const waiterSales = completedOrders
    .filter((order) => order.orderType === "WAITER")
    .reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

  const qrSales = completedOrders
    .filter((order) => order.orderType === "QR")
    .reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

  const formatMoney = (amount: number) =>
    `৳${amount.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getTableNumber = (table?: Table | null) =>
    table
      ? `T-${String(table.tableNumber).padStart(2, "0")}`
      : "N/A";

  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  const statusConfig: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },
    PREPARING: {
      label: "Preparing",
      className:
        "bg-violet-50 text-violet-700 border-violet-200",
    },
    READY: {
      label: "Ready",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    SERVED: {
      label: "Served",
      className:
        "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    COMPLETED: {
      label: "Completed",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    CANCELLED: {
      label: "Cancelled",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
  };

  const paymentConfig: Record<
    PaymentStatus,
    { label: string; className: string }
  > = {
    PAID: {
      label: "Paid",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    FAILED: {
      label: "Failed",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
    REFUNDED: {
      label: "Refunded",
      className:
        "bg-violet-50 text-violet-700 border-violet-200",
    },
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },
  };

  const getPaymentStatus = (order: Order): PaymentStatus =>
    order.payment?.status ?? "PENDING";

  const summaryCards = [
    {
      label: "Total Sales",
      value: formatMoney(totalSales),
      note: "From completed orders",
      icon: <Wallet size={18} />,
      box: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      note: period,
      icon: <ShoppingBag size={18} />,
      box: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Average Order",
      value: formatMoney(averageOrder),
      note: "Per completed order",
      icon: <BarChart3 size={18} />,
      box: "bg-violet-50 text-violet-600",
    },
    {
      label: "Paid Orders",
      value: paidOrders.length,
      note: "Payment completed",
      icon: <CreditCard size={18} />,
      box: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-sm">
            <BarChart3 size={21} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Reports
            </h2>
            <p className="text-xs text-slate-500">
              Restaurant sales and order performance
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <div className="relative">
            <CalendarDays
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
            />

            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value as ReportPeriod
                )
              }
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-emerald-400"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <span>{error}</span>

          <button
            onClick={fetchOrders}
            className="font-bold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <RefreshCw
            size={28}
            className="mx-auto mb-3 animate-spin text-emerald-500"
          />
          <p className="text-xs font-medium text-slate-500">
            Loading reports...
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {card.label}
                  </p>

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.box}`}
                  >
                    {card.icon}
                  </span>
                </div>

                <p className="mt-3 truncate text-xl font-bold text-slate-900">
                  {card.value}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {card.note}
                </p>
              </div>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-emerald-500"
                />
                <p className="text-xs font-bold text-slate-700">
                  Completed Orders
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {completedOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-4">
              <div className="flex items-center gap-2">
                <XCircle
                  size={16}
                  className="text-red-500"
                />
                <p className="text-xs font-bold text-slate-700">
                  Cancelled Orders
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {cancelledOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="text-violet-500"
                />
                <p className="text-xs font-bold text-slate-700">
                  Selected Period
                </p>
              </div>

              <p className="mt-2 text-lg font-bold text-violet-600">
                {period}
              </p>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Users size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Waiter Orders
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sales from waiter-based orders
                  </p>
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold text-slate-900">
                {formatMoney(waiterSales)}
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  style={{
                    width:
                      totalSales > 0
                        ? `${Math.min(
                            (waiterSales / totalSales) * 100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <QrCode size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    QR Self Orders
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sales from QR customer orders
                  </p>
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold text-slate-900">
                {formatMoney(qrSales)}
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{
                    width:
                      totalSales > 0
                        ? `${Math.min(
                            (qrSales / totalSales) * 100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sales & Order Details
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Order performance for{" "}
                  {period.toLowerCase()}
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                {filteredOrders.length} Orders
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {[
                      "Order",
                      "Table",
                      "Type",
                      "Total",
                      "Status",
                      "Payment",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const paymentStatus =
                        getPaymentStatus(order);

                      const status =
                        statusConfig[order.status];

                      const payment =
                        paymentConfig[paymentStatus];

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-bold text-slate-800">
                              {order.orderNumber}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                              {getTableNumber(order.table)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                order.orderType === "QR"
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-cyan-50 text-cyan-700"
                              }`}
                            >
                              {order.orderType === "QR"
                                ? "QR Self Order"
                                : "Waiter Order"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-slate-800">
                              {formatMoney(
                                Number(order.totalAmount)
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${payment.className}`}
                            >
                              {payment.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center"
                      >
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                          <ShoppingBag size={20} />
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          No orders found
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          No orders available for{" "}
                          {period.toLowerCase()}.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
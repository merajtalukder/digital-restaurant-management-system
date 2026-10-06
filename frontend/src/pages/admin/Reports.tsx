import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ShoppingBag,
  Wallet,
  CreditCard,
  CheckCircle2,
  Users,
  QrCode,
  RefreshCw,
  CalendarDays,
  Download,
  FileText,
  XCircle,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type ReportPeriod =
  | "Today"
  | "This Week"
  | "This Month"
  | "Previous Month";

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
  const [period, setPeriod] =
    useState<ReportPeriod>("Today");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [reportGenerated, setReportGenerated] =
    useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders?_t=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data: Order[] = await response.json();

      setOrders(Array.isArray(data) ? data : []);
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

      if (period === "Previous Month") {
        const previousMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        const startOfPreviousMonth = new Date(
          previousMonth.getFullYear(),
          previousMonth.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

        const startOfCurrentMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

        return (
          orderDate >= startOfPreviousMonth &&
          orderDate < startOfCurrentMonth
        );
      }

      return true;
    });
  }, [orders, period]);

  const paidOrders = filteredOrders.filter(
    (order) => order.payment?.status === "PAID"
  );

  const completedOrders = filteredOrders.filter(
    (order) => order.status === "COMPLETED"
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "CANCELLED"
  );

  const totalSales = paidOrders.reduce(
    (sum, order) =>
      sum +
      Number(
        order.payment?.amount ?? order.totalAmount
      ),
    0
  );

  const totalOrders = filteredOrders.length;

  const averageOrder =
    paidOrders.length > 0
      ? totalSales / paidOrders.length
      : 0;

  const waiterSales = paidOrders
    .filter((order) => order.orderType === "WAITER")
    .reduce(
      (sum, order) =>
        sum +
        Number(
          order.payment?.amount ?? order.totalAmount
        ),
      0
    );

  const qrSales = paidOrders
    .filter((order) => order.orderType === "QR")
    .reduce(
      (sum, order) =>
        sum +
        Number(
          order.payment?.amount ?? order.totalAmount
        ),
      0
    );

  const paidPercentage =
    totalOrders > 0
      ? (paidOrders.length / totalOrders) * 100
      : 0;

  const completedPercentage =
    totalOrders > 0
      ? (completedOrders.length / totalOrders) * 100
      : 0;

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
        "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    SERVED: {
      label: "Served",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
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

  const getPaymentStatus = (
    order: Order
  ): PaymentStatus =>
    order.payment?.status ?? "PENDING";

  const generateReport = async () => {
    try {
      setGenerating(true);
      setReportGenerated(false);

      await fetchOrders();

      setReportGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (filteredOrders.length === 0) {
      alert("There is no report data to download.");
      return;
    }

    const reportDate = new Date().toLocaleString();

    const rows: string[][] = [];

    rows.push([
      "Restaurant Sales Report",
      "",
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Period",
      period,
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Generated At",
      reportDate,
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Total Sales",
      formatMoney(totalSales),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Total Orders",
      String(totalOrders),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Completed Orders",
      String(completedOrders.length),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Cancelled Orders",
      String(cancelledOrders.length),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Paid Orders",
      String(paidOrders.length),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Average Order",
      formatMoney(averageOrder),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "Waiter Sales",
      formatMoney(waiterSales),
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "QR Sales",
      formatMoney(qrSales),
      "",
      "",
      "",
      "",
    ]);

    rows.push(["", "", "", "", "", ""]);

    rows.push([
      "Order",
      "Table",
      "Type",
      "Total",
      "Status",
      "Payment",
    ]);

    filteredOrders.forEach((order) => {
      rows.push([
        order.orderNumber,
        getTableNumber(order.table),
        order.orderType === "QR"
          ? "QR Self Order"
          : "Waiter Order",
        formatMoney(Number(order.totalAmount)),
        statusConfig[order.status].label,
        paymentConfig[
          getPaymentStatus(order)
        ].label,
      ]);
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(value).replace(
              /"/g,
              '""'
            );

            return `"${safeValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    const link = document.createElement("a");

    link.href = url;

    link.download = `restaurant-${period
      .toLowerCase()
      .replace(/\s+/g, "-")}-report-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Total Sales",
      value: formatMoney(totalSales),
      note: "From paid orders",
      icon: Wallet,
      iconClass:
        "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      note: period,
      icon: ShoppingBag,
      iconClass:
        "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Average Order",
      value: formatMoney(averageOrder),
      note: "Per paid order",
      icon: TrendingUp,
      iconClass:
        "bg-violet-50 text-violet-600",
    },
    {
      label: "Paid Orders",
      value: paidOrders.length,
      note: "Payment completed",
      icon: CreditCard,
      iconClass:
        "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div
      className="min-h-full min-w-0 p-4 sm:p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(248,250,252,0.24), rgba(248,250,252,0.24)), url('/restaurant-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Reports
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                Sales performance and order analytics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarDays
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"
              />

              <select
                value={period}
                onChange={(e) => {
                  setPeriod(
                    e.target.value as ReportPeriod
                  );
                  setReportGenerated(false);
                }}
                className="appearance-none rounded-xl border border-white/70 bg-white/85 py-2.5 pl-9 pr-8 text-xs font-bold text-slate-700 shadow-sm outline-none backdrop-blur-md transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Today">
                  Today
                </option>

                <option value="This Week">
                  This Week
                </option>

                <option value="This Month">
                  This Month
                </option>

                <option value="Previous Month">
                  Previous Month
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/85 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={generateReport}
              disabled={loading || generating}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <FileText
                size={14}
                className={
                  generating
                    ? "animate-pulse"
                    : ""
                }
              />

              {generating
                ? "Generating..."
                : "Generate"}
            </button>

            <button
              type="button"
              onClick={downloadReport}
              disabled={
                loading ||
                filteredOrders.length === 0
              }
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {reportGenerated && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-md">
            <CheckCircle2 size={15} />
            Report refreshed successfully for {period}.
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-xs text-red-700 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
              <XCircle size={15} />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
              className="font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/70 bg-white/85 py-20 text-center shadow-xl backdrop-blur-md">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin text-emerald-500"
            />

            <p className="text-xs font-semibold text-slate-500">
              Loading reports...
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="group rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          {card.label}
                        </p>

                        <p className="mt-2 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                          {card.value}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                      >
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <ReceiptText size={11} />
                      {card.note}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Overview */}
            <div className="mb-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Performance Overview
                    </h3>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      Payment and order completion summary
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <BarChart3 size={17} />
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard
                          size={15}
                          className="text-emerald-600"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          Payment Rate
                        </span>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900">
                        {paidPercentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            paidPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-slate-400">
                      {paidOrders.length} of{" "}
                      {totalOrders} orders paid
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className="text-cyan-600"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          Completion Rate
                        </span>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900">
                        {completedPercentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            completedPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-slate-400">
                      {completedOrders.length} completed
                      orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Order Sources
                    </h3>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      Paid sales by order channel
                    </p>
                  </div>

                  <TrendingUp
                    size={18}
                    className="text-slate-500"
                  />
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users
                          size={15}
                          className="text-cyan-600"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          Waiter Orders
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-slate-900">
                        {formatMoney(waiterSales)}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{
                          width:
                            totalSales > 0
                              ? `${Math.min(
                                  (waiterSales /
                                    totalSales) *
                                    100,
                                  100
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode
                          size={15}
                          className="text-violet-600"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          QR Self Orders
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-slate-900">
                        {formatMoney(qrSales)}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-500"
                        style={{
                          width:
                            totalSales > 0
                              ? `${Math.min(
                                  (qrSales /
                                    totalSales) *
                                    100,
                                  100
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-600"
                  />

                  <span className="text-[11px] font-bold text-slate-600">
                    Completed
                  </span>
                </div>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {completedOrders.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <XCircle
                    size={15}
                    className="text-red-500"
                  />

                  <span className="text-[11px] font-bold text-slate-600">
                    Cancelled
                  </span>
                </div>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {cancelledOrders.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={15}
                    className="text-teal-600"
                  />

                  <span className="text-[11px] font-bold text-slate-600">
                    Paid
                  </span>
                </div>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {paidOrders.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={15}
                    className="text-violet-600"
                  />

                  <span className="text-[11px] font-bold text-slate-600">
                    Period
                  </span>
                </div>

                <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
                  {period}
                </p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/88 shadow-xl backdrop-blur-md">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Sales & Order Details
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                      {period}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Detailed order activity for the selected
                    period
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                    <ReceiptText size={11} />
                    {filteredOrders.length} Orders
                  </span>

                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                    {formatMoney(totalSales)}
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
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
                          className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
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
                          statusConfig[
                            order.status
                          ];

                        const payment =
                          paymentConfig[
                            paymentStatus
                          ];

                        return (
                          <tr
                            key={order.id}
                            className="border-b border-slate-100 last:border-0 transition hover:bg-emerald-50/35"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <ShoppingBag
                                    size={14}
                                  />
                                </div>

                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {
                                      order.orderNumber
                                    }
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    {formatDate(
                                      order.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                {getTableNumber(
                                  order.table
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                                  order.orderType ===
                                  "QR"
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-cyan-50 text-cyan-700"
                                }`}
                              >
                                {order.orderType ===
                                "QR" ? (
                                  <QrCode size={11} />
                                ) : (
                                  <Users size={11} />
                                )}

                                {order.orderType ===
                                "QR"
                                  ? "QR Self Order"
                                  : "Waiter Order"}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className="text-xs font-extrabold text-slate-800">
                                {formatMoney(
                                  Number(
                                    order.totalAmount
                                  )
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${payment.className}`}
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
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <ShoppingBag size={21} />
                          </div>

                          <p className="mt-3 text-xs font-bold text-slate-600">
                            No orders found
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            No orders are available for{" "}
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
    </div>
  );
};

export default Reports;
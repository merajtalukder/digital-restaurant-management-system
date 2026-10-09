
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock3,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  Table2,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://digital-restaurant-backend.onrender.com";

const VAT_RATE = 0.05;

type Period = "Today" | "This Week" | "This Month" | "Previous Month";

interface Order {
  id: number;
  orderNumber?: string;
  status?: string;
  orderType?: string;
  totalAmount?: number | string;
  createdAt?: string;
  table?: { id?: number; tableNumber?: string };
  items?: unknown[];
  orderItems?: unknown[];
}

interface RestaurantTable {
  id: number;
  tableNumber?: string;
  status?: string;
}

interface MenuItem {
  id: number;
  name: string;
  price?: number | string;
  isAvailable?: boolean;
  category?: { name?: string };
}

interface Payment {
  id: number;
  amount?: number | string;
  method?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  order?: { id?: number; orderNumber?: string };
}

interface Staff {
  id: number;
  name?: string;
  role?: string;
  status?: string;
}

interface SalesPoint {
  label: string;
  value: number;
}

const formatCurrency = (value: number) =>
  `৳${Math.round(value).toLocaleString("en-BD")}`;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (value?: string) =>
  String(value || "").toUpperCase();

const getOrderAmount = (order: Order) => toNumber(order.totalAmount);

const getOrderDate = (order: Order) => {
  if (!order.createdAt) return null;
  const date = new Date(order.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPaymentMethod = (payment: Payment) =>
  String(payment.paymentMethod || payment.method || "").toUpperCase();

const getPaymentStatus = (payment: Payment) =>
  String(payment.status || "").toUpperCase();

const getTableStatus = (table: RestaurantTable) =>
  String(table.status || "").toUpperCase();

const getItemCategory = (item: MenuItem) =>
  item.category?.name || "Uncategorized";

const isWithinPeriod = (date: Date | null, period: Period) => {
  if (!date) return false;

  const now = new Date();

  if (period === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (period === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diff);

    return date >= start && date <= now;
  }

  if (period === "This Month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return date >= previousMonth && date < nextMonth;
};

const getPreviousPeriodDates = (period: Period) => {
  const now = new Date();

  if (period === "Today") {
    const previous = new Date(now);
    previous.setDate(previous.getDate() - 1);

    return {
      start: new Date(
        previous.getFullYear(),
        previous.getMonth(),
        previous.getDate()
      ),
      end: new Date(
        previous.getFullYear(),
        previous.getMonth(),
        previous.getDate() + 1
      ),
    };
  }

  if (period === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diff);

    return {
      start: new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: start,
    };
  }

  if (period === "This Month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    end: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
};

const isWithinDateRange = (
  date: Date | null,
  start: Date,
  end: Date
): boolean => {
  if (!date) return false;
  return date >= start && date < end;
};

const getOrderLabel = (order: Order) =>
  order.orderNumber || `#${order.id}`;

const getOrderTypeLabel = (order: Order) => {
  const type = normalizeStatus(order.orderType);
  if (type === "QR") return "QR Order";
  if (type === "WAITER") return "Waiter";
  return type || "Order";
};

const statusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "PENDING": return "Pending";
    case "PREPARING": return "Preparing";
    case "READY": return "Ready";
    case "SERVED": return "Served";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    case "PAID": return "Paid";
    case "FAILED": return "Failed";
    case "REFUNDED": return "Refunded";
    default: return normalized || "Unknown";
  }
};

const statusClasses = (status?: string) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "COMPLETED":
    case "PAID":
    case "READY":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "PREPARING":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "CANCELLED":
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-100";
    case "SERVED":
      return "bg-violet-50 text-violet-700 border-violet-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  positive = true,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  positive?: boolean;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between gap-2">
      <span className="text-xs text-slate-400">{subtitle}</span>
      {trend && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-600" : "text-red-600"}`}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trend}
        </span>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [period, setPeriod] = useState<Period>("Today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const token = localStorage.getItem("token");

      const requestOptions: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const endpoints = [
        "/orders",
        "/tables",
        "/menu-items",
        "/payments",
        "/users",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${API_URL}${endpoint}`, requestOptions)
        )
      );

      const failedResponses = responses
        .map((response, index) => ({
          endpoint: endpoints[index],
          status: response.status,
          ok: response.ok,
        }))
        .filter((response) => !response.ok);

      if (failedResponses.length > 0) {
        console.error("Dashboard API errors:", failedResponses);
        throw new Error(
          failedResponses
            .map((response) => `${response.endpoint} (${response.status})`)
            .join(", ")
        );
      }

      const [
        ordersData,
        tablesData,
        menuItemsData,
        paymentsData,
        staffData,
      ] = await Promise.all(responses.map((response) => response.json()));

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setMenuItems(Array.isArray(menuItemsData) ? menuItemsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err instanceof Error
          ? `Unable to load dashboard data: ${err.message}`
          : "Unable to load dashboard data. Please check the backend connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredOrders = useMemo(
    () => orders.filter((order) => isWithinPeriod(getOrderDate(order), period)),
    [orders, period]
  );

  const previousPeriodOrders = useMemo(() => {
    const { start, end } = getPreviousPeriodDates(period);
    return orders.filter((order) =>
      isWithinDateRange(getOrderDate(order), start, end)
    );
  }, [orders, period]);

  const salesOrders = useMemo(
    () => filteredOrders.filter((order) => normalizeStatus(order.status) !== "CANCELLED"),
    [filteredOrders]
  );

  const totalSales = useMemo(
    () => salesOrders.reduce((total, order) => total + getOrderAmount(order), 0),
    [salesOrders]
  );

  const previousSales = useMemo(
    () =>
      previousPeriodOrders
        .filter((order) => normalizeStatus(order.status) !== "CANCELLED")
        .reduce((total, order) => total + getOrderAmount(order), 0),
    [previousPeriodOrders]
  );

  const salesChange = useMemo(() => {
    if (previousSales === 0) return totalSales > 0 ? 100 : 0;
    return ((totalSales - previousSales) / previousSales) * 100;
  }, [totalSales, previousSales]);

  const totalOrders = filteredOrders.length;
  const previousOrderCount = previousPeriodOrders.length;

  const orderChange = useMemo(() => {
    if (previousOrderCount === 0) return totalOrders > 0 ? 100 : 0;
    return ((totalOrders - previousOrderCount) / previousOrderCount) * 100;
  }, [totalOrders, previousOrderCount]);

  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  const paidPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          getPaymentStatus(payment) === "PAID" &&
          isWithinPeriod(payment.createdAt ? new Date(payment.createdAt) : null, period)
      ),
    [payments, period]
  );

  const paidAmount = paidPayments.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          getPaymentStatus(payment) === "PENDING" &&
          isWithinPeriod(payment.createdAt ? new Date(payment.createdAt) : null, period)
      ),
    [payments, period]
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => normalizeStatus(order.status) === "CANCELLED"
  ).length;

  const occupiedTables = tables.filter(
    (table) => getTableStatus(table) === "OCCUPIED"
  ).length;

  const availableTables = tables.filter(
    (table) => getTableStatus(table) === "AVAILABLE"
  ).length;

  const reservedTables = tables.filter(
    (table) => getTableStatus(table) === "RESERVED"
  ).length;

  const activeOrders = filteredOrders.filter((order) =>
    ["PENDING", "PREPARING", "READY", "SERVED"].includes(normalizeStatus(order.status))
  );

  const kitchenPending = filteredOrders.filter(
    (order) => normalizeStatus(order.status) === "PENDING"
  ).length;

  const kitchenPreparing = filteredOrders.filter(
    (order) => normalizeStatus(order.status) === "PREPARING"
  ).length;

  const kitchenReady = filteredOrders.filter(
    (order) => normalizeStatus(order.status) === "READY"
  ).length;

  const waiterOrders = filteredOrders.filter(
    (order) => normalizeStatus(order.orderType) === "WAITER"
  );

  const qrOrders = filteredOrders.filter(
    (order) => normalizeStatus(order.orderType) === "QR"
  );

  const paymentBreakdown = useMemo(() => {
    const methods = ["CASH", "CARD", "BKASH", "NAGAD", "ROCKET"];

    return methods.map((method) => {
      const amount = paidPayments
        .filter((payment) => getPaymentMethod(payment) === method)
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

      return {
        method,
        amount,
        percentage: paidAmount > 0 ? (amount / paidAmount) * 100 : 0,
      };
    });
  }, [paidPayments, paidAmount]);

  const salesPoints: SalesPoint[] = useMemo(() => {
    const now = new Date();

    if (period === "Today" || period === "This Week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);

        if (period === "Today") {
          date.setDate(now.getDate() - (6 - index));
        } else {
          const day = date.getDay();
          const mondayOffset = day === 0 ? 6 : day - 1;
          date.setDate(now.getDate() - mondayOffset + index);
        }

        const value = salesOrders
          .filter((order) => {
            const orderDate = getOrderDate(order);
            return orderDate && orderDate.toDateString() === date.toDateString();
          })
          .reduce((sum, order) => sum + getOrderAmount(order), 0);

        return {
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          value,
        };
      });
    }

    const days =
      period === "Previous Month"
        ? new Date(now.getFullYear(), now.getMonth(), 0).getDate()
        : now.getDate();

    const pointCount = Math.min(days, 7);

    return Array.from({ length: pointCount }, (_, index) => {
      const dayNumber = Math.max(1, days - (pointCount - 1) + index);
      const targetMonth =
        period === "Previous Month" ? now.getMonth() - 1 : now.getMonth();

      const date = new Date(now.getFullYear(), targetMonth, dayNumber);

      const value = salesOrders
        .filter((order) => {
          const orderDate = getOrderDate(order);
          return (
            orderDate &&
            orderDate.getFullYear() === date.getFullYear() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getDate() === date.getDate()
          );
        })
        .reduce((sum, order) => sum + getOrderAmount(order), 0);

      return {
        label: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        value,
      };
    });
  }, [salesOrders, period]);

  const chartMax = Math.max(...salesPoints.map((point) => point.value), 1);

  const topMenuItems = useMemo(() => {
    const counts = new Map<number, { item: MenuItem; quantity: number }>();

    salesOrders.forEach((order) => {
      const items = Array.isArray(order.orderItems)
        ? order.orderItems
        : Array.isArray(order.items)
          ? order.items
          : [];

      items.forEach((rawItem) => {
        const item = rawItem as {
          menuItem?: MenuItem;
          quantity?: number | string;
          menuItemId?: number;
        };

        const menuItem =
          item.menuItem ||
          menuItems.find((menu) => menu.id === Number(item.menuItemId));

        if (!menuItem) return;

        const quantity = toNumber(item.quantity) || 1;
        const existing = counts.get(menuItem.id);

        if (existing) existing.quantity += quantity;
        else counts.set(menuItem.id, { item: menuItem, quantity });
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [salesOrders, menuItems]);

  const categoryBreakdown = useMemo(() => {
    const categories = new Map<string, number>();

    menuItems.forEach((item) => {
      const category = getItemCategory(item);
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [menuItems]);

  const activeStaff = staff.filter(
    (member) => normalizeStatus(member.status) === "ACTIVE"
  ).length;

  const roleBreakdown = useMemo(() => {
    const roles = ["WAITER", "CASHIER", "KITCHEN", "ADMIN"];

    return roles.map((role) => ({
      role,
      count: staff.filter((member) => normalizeStatus(member.role) === role).length,
    }));
  }, [staff]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => {
          const aDate = getOrderDate(a)?.getTime() || 0;
          const bDate = getOrderDate(b)?.getTime() || 0;
          return bDate - aDate;
        })
        .slice(0, 7),
    [orders]
  );

  const formatTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const periodLabel = {
    Today: "today",
    "This Week": "this week",
    "This Month": "this month",
    "Previous Month": "previous month",
  }[period];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-6 xl:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Restaurant is open
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Restaurant Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete business performance and operation analysis for {periodLabel}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Previous Month">Previous Month</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              aria-label="Payment notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
            >
              <Bell className="h-4.5 w-4.5" />
              {pendingPayments.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Dashboard data unavailable</p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Total Sales" value={loading ? "—" : formatCurrency(totalSales)} subtitle={`Sales for ${periodLabel}`} icon={<DollarSign className="h-5 w-5" />} trend={`${Math.abs(salesChange).toFixed(1)}%`} positive={salesChange >= 0} />
          <MetricCard title="Total Orders" value={loading ? "—" : totalOrders.toLocaleString()} subtitle={`Orders for ${periodLabel}`} icon={<ShoppingBag className="h-5 w-5" />} trend={`${Math.abs(orderChange).toFixed(1)}%`} positive={orderChange >= 0} />
          <MetricCard title="Average Order" value={loading ? "—" : formatCurrency(averageOrder)} subtitle="Average ticket value" icon={<BarChart3 className="h-5 w-5" />} />
          <MetricCard title="Paid Revenue" value={loading ? "—" : formatCurrency(paidAmount)} subtitle={`${paidPayments.length} paid payments`} icon={<WalletCards className="h-5 w-5" />} />
          <MetricCard title="Pending Payments" value={loading ? "—" : formatCurrency(pendingAmount)} subtitle={`${pendingPayments.length} pending`} icon={<Clock3 className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sales Overview</h2>
                <p className="mt-1 text-xs text-slate-500">Revenue performance across the selected period</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-500">Total</span>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalSales)}</p>
              </div>
            </div>

            <div className="mt-7 h-[270px]">
              <div className="relative h-full">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[100, 75, 50, 25, 0].map((line) => (
                    <div key={line} className="border-t border-dashed border-slate-100" />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-7 top-2 flex items-end gap-3 px-1">
                  {salesPoints.map((point, index) => {
                    const height = point.value === 0 ? 2 : Math.max(5, (point.value / chartMax) * 100);
                    return (
                      <div key={`${point.label}-${index}`} className="group relative flex h-full flex-1 flex-col justify-end">
                        <div className="mx-auto w-full max-w-[54px] rounded-t-lg bg-slate-900/90 transition-all duration-300 group-hover:bg-slate-700" style={{ height: `${height}%` }} />
                        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover:block">
                          {formatCurrency(point.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-2 px-1">
                  {salesPoints.map((point, index) => (
                    <span key={`${point.label}-label-${index}`} className="flex-1 text-center text-[10px] font-medium text-slate-400">
                      {point.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-base font-bold text-slate-900">Order Status</h2>
            <p className="mt-1 text-xs text-slate-500">Live order distribution</p>
            <div className="mt-6 space-y-3">
              {[
                ["PENDING", "Pending", AlertCircle],
                ["PREPARING", "Preparing", ChefHat],
                ["READY", "Ready", CheckCircle2],
                ["SERVED", "Served", ShoppingBag],
                ["COMPLETED", "Completed", CheckCircle2],
                ["CANCELLED", "Cancelled", XCircle],
              ].map(([key, label, Icon]) => {
                const count = filteredOrders.filter((order) => normalizeStatus(order.status) === key).length;
                const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                const IconComponent = Icon as typeof AlertCircle;

                return (
                  <div key={String(key)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">{String(label)}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-800 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Table Status</h2>
                <p className="mt-1 text-xs text-slate-500">Current floor occupancy</p>
              </div>
              <Table2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{availableTables}</p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">Available</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{occupiedTables}</p>
                <p className="mt-1 text-[11px] font-semibold text-amber-600">Occupied</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-4 text-center">
                <p className="text-2xl font-bold text-violet-700">{reservedTables}</p>
                <p className="mt-1 text-[11px] font-semibold text-violet-600">Reserved</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Total tables</span>
              <span className="text-sm font-bold text-slate-900">{tables.length}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Payment Breakdown</h2>
                <p className="mt-1 text-xs text-slate-500">Paid revenue by method</p>
              </div>
              <CreditCard className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              {paymentBreakdown.map((payment) => (
                <div key={payment.method}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{payment.method}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-800" style={{ width: `${Math.min(payment.percentage, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Order Channels</h2>
                <p className="mt-1 text-xs text-slate-500">Waiter vs QR ordering</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Waiter Orders</span>
                  <span className="text-sm font-bold text-slate-900">{waiterOrders.length}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-slate-900" style={{ width: `${totalOrders > 0 ? (waiterOrders.length / totalOrders) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">QR Orders</span>
                  <span className="text-sm font-bold text-slate-900">{qrOrders.length}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-slate-500" style={{ width: `${totalOrders > 0 ? (qrOrders.length / totalOrders) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[11px] text-slate-400">Active orders</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{activeOrders.length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Cancelled</p>
                  <p className="mt-1 text-lg font-bold text-red-600">{cancelledOrders}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Menu Performance</h2>
                <p className="mt-1 text-xs text-slate-500">Best performing items and menu distribution</p>
              </div>
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Top Selling Items</p>
                <div className="space-y-3">
                  {topMenuItems.length > 0 ? topMenuItems.map((entry, index) => (
                    <div key={entry.item.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{entry.item.name}</p>
                        <p className="text-[11px] text-slate-400">{getItemCategory(entry.item)}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{entry.quantity} sold</span>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">No item sales data available for this period.</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu Categories</p>
                  <span className="text-xs font-semibold text-slate-500">{menuItems.length} items</span>
                </div>
                <div className="space-y-3">
                  {categoryBreakdown.length > 0 ? categoryBreakdown.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                      <span className="text-xs font-bold text-slate-500">{count} items</span>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">No menu categories available.</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-400">Available</p>
                    <p className="mt-1 text-lg font-bold text-emerald-600">{menuItems.filter((item) => item.isAvailable !== false).length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-400">Unavailable</p>
                    <p className="mt-1 text-lg font-bold text-red-600">{menuItems.filter((item) => item.isAvailable === false).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Kitchen Overview</h2>
                <p className="mt-1 text-xs text-slate-500">Current kitchen workload</p>
              </div>
              <ChefHat className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-amber-50 p-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="mt-3 text-2xl font-bold text-amber-700">{kitchenPending}</p>
                <p className="mt-1 text-[11px] font-semibold text-amber-600">Pending</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <ChefHat className="h-4 w-4 text-blue-600" />
                <p className="mt-3 text-2xl font-bold text-blue-700">{kitchenPreparing}</p>
                <p className="mt-1 text-[11px] font-semibold text-blue-600">Preparing</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="mt-3 text-2xl font-bold text-emerald-700">{kitchenReady}</p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">Ready</p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Kitchen workload</p>
                  <p className="mt-1 text-[11px] text-slate-400">Active kitchen orders</p>
                </div>
                <span className="text-lg font-bold text-slate-900">{kitchenPending + kitchenPreparing + kitchenReady}</span>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="bg-amber-400" style={{ width: `${activeOrders.length > 0 ? (kitchenPending / activeOrders.length) * 100 : 0}%` }} />
                <div className="bg-blue-500" style={{ width: `${activeOrders.length > 0 ? (kitchenPreparing / activeOrders.length) * 100 : 0}%` }} />
                <div className="bg-emerald-500" style={{ width: `${activeOrders.length > 0 ? (kitchenReady / activeOrders.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] text-slate-400">Total menu items</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{menuItems.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] text-slate-400">Active staff</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{activeStaff}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Staff Overview</h2>
                <p className="mt-1 text-xs text-slate-500">Current team composition</p>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {roleBreakdown.map((role) => (
                <div key={role.role} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{role.role}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{role.count}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Total registered staff</span>
              <span className="text-sm font-bold text-slate-900">{staff.length}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Payment Alerts</h2>
                <p className="mt-1 text-xs text-slate-500">Payments requiring attention</p>
              </div>
              <Clock3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">Pending Payments</p>
                <p className="mt-2 text-2xl font-bold text-amber-800">{pendingPayments.length}</p>
                <p className="mt-1 text-xs text-amber-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">Paid Payments</p>
                <p className="mt-2 text-2xl font-bold text-emerald-800">{paidPayments.length}</p>
                <p className="mt-1 text-xs text-emerald-600">{formatCurrency(paidAmount)}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Payment collection rate</span>
              <span className="text-sm font-bold text-slate-900">
                {paidAmount + pendingAmount > 0 ? `${((paidAmount / (paidAmount + pendingAmount)) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
              <p className="mt-1 text-xs text-slate-500">Latest restaurant activity</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              Showing latest {Math.min(recentOrders.length, 7)} orders
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  {["Order", "Table", "Channel", "Amount", "Status", "Time"].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-4"><span className="text-sm font-bold text-slate-800">{getOrderLabel(order)}</span></td>
                    <td className="px-5 py-4"><span className="text-sm text-slate-600">{order.table?.tableNumber ? `T-${order.table.tableNumber}` : "—"}</span></td>
                    <td className="px-5 py-4"><span className="text-sm text-slate-600">{getOrderTypeLabel(order)}</span></td>
                    <td className="px-5 py-4"><span className="text-sm font-bold text-slate-900">{formatCurrency(getOrderAmount(order))}</span></td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClasses(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs text-slate-500">{formatTime(order.createdAt)}</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <ShoppingBag className="mx-auto h-8 w-8 text-slate-200" />
                      <p className="mt-3 text-sm font-medium text-slate-500">No orders available.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5"><Table2 className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[11px] text-slate-400">Table occupancy</p>
                <p className="text-lg font-bold text-slate-900">{tables.length > 0 ? `${Math.round((occupiedTables / tables.length) * 100)}%` : "0%"}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5"><ChefHat className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[11px] text-slate-400">Kitchen queue</p>
                <p className="text-lg font-bold text-slate-900">{kitchenPending + kitchenPreparing}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5"><Users className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[11px] text-slate-400">Active staff</p>
                <p className="text-lg font-bold text-slate-900">{activeStaff}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5"><CreditCard className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[11px] text-slate-400">Payment collection</p>
                <p className="text-lg font-bold text-slate-900">
                  {paidAmount + pendingAmount > 0 ? `${Math.round((paidAmount / (paidAmount + pendingAmount)) * 100)}%` : "0%"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-2 text-center text-[11px] text-slate-400">
          VAT calculated at {(VAT_RATE * 100).toFixed(0)}% where applicable.
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
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

// Use the deployed backend by default.
// You can override this using VITE_API_URL in your frontend environment.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://digital-restaurant-backend.onrender.com"
).replace(/\/+$/, "");

type Period = "Today" | "This Week" | "This Month" | "Previous Month";

interface Order {
  id: number;
  orderNumber?: string;
  status?: string;
  orderType?: string;
  totalAmount?: number | string;
  createdAt?: string;
  table?: {
    id?: number;
    tableNumber?: string;
  };
  items?: OrderItem[];
  orderItems?: OrderItem[];
}

interface OrderItem {
  id?: number;
  quantity?: number | string;
  menuItemId?: number;
  menuItem?: MenuItem;
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
  category?: {
    name?: string;
  };
}

interface Payment {
  id: number;
  amount?: number | string;
  method?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  order?: {
    id?: number;
    orderNumber?: string;
  };
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

const currency = (value: number) =>
  `৳${Math.round(value).toLocaleString("en-BD")}`;

const numberValue = (value: unknown): number => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const normalize = (value?: string) =>
  String(value || "").trim().toUpperCase();

const orderAmount = (order: Order) => numberValue(order.totalAmount);

const orderDate = (order: Order): Date | null => {
  if (!order.createdAt) return null;
  const date = new Date(order.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const paymentDate = (payment: Payment): Date | null => {
  if (!payment.createdAt) return null;
  const date = new Date(payment.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const paymentMethod = (payment: Payment) =>
  normalize(payment.paymentMethod || payment.method);

const paymentStatus = (payment: Payment) => normalize(payment.status);

const getTableStatus = (table: RestaurantTable) =>
  normalize(table.status);

const getCategory = (item: MenuItem) =>
  item.category?.name || "Uncategorized";

const orderLabel = (order: Order) =>
  order.orderNumber || `#${order.id}`;

const orderChannel = (order: Order) => {
  const type = normalize(order.orderType);
  if (type === "QR") return "QR Order";
  if (type === "WAITER") return "Waiter";
  return type || "Order";
};

const statusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    PREPARING: "Preparing",
    READY: "Ready",
    SERVED: "Served",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  };

  const key = normalize(status);
  return labels[key] || key || "Unknown";
};

const statusClasses = (status?: string) => {
  const styles: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
    READY: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PREPARING: "bg-blue-50 text-blue-700 border-blue-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
    FAILED: "bg-red-50 text-red-700 border-red-100",
    SERVED: "bg-violet-50 text-violet-700 border-violet-100",
    REFUNDED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    styles[normalize(status)] ||
    "bg-slate-50 text-slate-600 border-slate-100"
  );
};

const isWithinPeriod = (date: Date | null, period: Period) => {
  if (!date) return false;

  const now = new Date();

  if (period === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (period === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    start.setHours(0, 0, 0, 0);

    return date >= start && date <= now;
  }

  if (period === "This Month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  return date >= start && date < end;
};

const getPreviousPeriodDates = (period: Period) => {
  const now = new Date();

  if (period === "Today") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
  }

  if (period === "This Week") {
    const end = new Date(now);
    const day = end.getDay();
    end.setDate(end.getDate() - (day === 0 ? 6 : day - 1));
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    return { start, end };
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

const inDateRange = (
  date: Date | null,
  start: Date,
  end: Date
) => Boolean(date && date >= start && date < end);

const getToken = () => {
  // Supports common JWT storage keys.
  // Change this list if your Login page uses a different key.
  const keys = ["accessToken", "access_token", "token", "authToken"];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

const unwrapArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.data)) return data.data as T[];
    if (Array.isArray(data.items)) return data.items as T[];
    if (Array.isArray(data.results)) return data.results as T[];
  }

  return [];
};

async function fetchApi<T>(endpoint: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Access denied for ${endpoint} (HTTP ${response.status}). Check login and API permissions.`
      );
    }

    if (response.status === 503 || response.status === 502) {
      throw new Error(
        "Render backend is temporarily unavailable. Check your Render service and deployment logs."
      );
    }

    throw new Error(
      `API ${endpoint} returned HTTP ${response.status}.`
    );
  }

  return (await response.json()) as T;
}

function MetricCard({
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
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400">{subtitle}</span>

        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon && <div className="shrink-0 text-slate-400">{icon}</div>}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

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

  const loadDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const results = await Promise.allSettled([
        fetchApi<unknown>("/orders"),
        fetchApi<unknown>("/tables"),
        fetchApi<unknown>("/menu-items"),
        fetchApi<unknown>("/payments"),
        fetchApi<unknown>("/users"),
      ]);

      const endpointNames = [
        "orders",
        "tables",
        "menu-items",
        "payments",
        "users",
      ];

      const failures = results
        .map((result, index) =>
          result.status === "rejected"
            ? `${endpointNames[index]}: ${
                result.reason instanceof Error
                  ? result.reason.message
                  : "Request failed"
              }`
            : ""
        )
        .filter(Boolean);

      if (results[0].status === "fulfilled") {
        setOrders(unwrapArray<Order>(results[0].value));
      }

      if (results[1].status === "fulfilled") {
        setTables(unwrapArray<RestaurantTable>(results[1].value));
      }

      if (results[2].status === "fulfilled") {
        setMenuItems(unwrapArray<MenuItem>(results[2].value));
      }

      if (results[3].status === "fulfilled") {
        setPayments(unwrapArray<Payment>(results[3].value));
      }

      if (results[4].status === "fulfilled") {
        setStaff(unwrapArray<Staff>(results[4].value));
      }

      if (failures.length > 0) {
        setError(failures.join(" "));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();

    // Refresh dashboard data periodically.
    const interval = window.setInterval(() => {
      void loadDashboard(true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => isWithinPeriod(orderDate(order), period)),
    [orders, period]
  );

  const previousPeriodOrders = useMemo(() => {
    const { start, end } = getPreviousPeriodDates(period);

    return orders.filter((order) =>
      inDateRange(orderDate(order), start, end)
    );
  }, [orders, period]);

  const salesOrders = useMemo(
    () =>
      filteredOrders.filter(
        (order) => normalize(order.status) !== "CANCELLED"
      ),
    [filteredOrders]
  );

  const previousSales = useMemo(
    () =>
      previousPeriodOrders
        .filter((order) => normalize(order.status) !== "CANCELLED")
        .reduce((sum, order) => sum + orderAmount(order), 0),
    [previousPeriodOrders]
  );

  const totalSales = useMemo(
    () => salesOrders.reduce((sum, order) => sum + orderAmount(order), 0),
    [salesOrders]
  );

  const totalOrders = filteredOrders.length;
  const previousOrderCount = previousPeriodOrders.length;

  const salesChange =
    previousSales > 0
      ? ((totalSales - previousSales) / previousSales) * 100
      : totalSales > 0
        ? 100
        : 0;

  const orderChange =
    previousOrderCount > 0
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
      : totalOrders > 0
        ? 100
        : 0;

  const averageOrder =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  const paidPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          paymentStatus(payment) === "PAID" &&
          isWithinPeriod(paymentDate(payment), period)
      ),
    [payments, period]
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          paymentStatus(payment) === "PENDING" &&
          isWithinPeriod(paymentDate(payment), period)
      ),
    [payments, period]
  );

  const paidAmount = paidPayments.reduce(
    (sum, payment) => sum + numberValue(payment.amount),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + numberValue(payment.amount),
    0
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => normalize(order.status) === "CANCELLED"
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
    ["PENDING", "PREPARING", "READY", "SERVED"].includes(
      normalize(order.status)
    )
  );

  const kitchenPending = filteredOrders.filter(
    (order) => normalize(order.status) === "PENDING"
  ).length;

  const kitchenPreparing = filteredOrders.filter(
    (order) => normalize(order.status) === "PREPARING"
  ).length;

  const kitchenReady = filteredOrders.filter(
    (order) => normalize(order.status) === "READY"
  ).length;

  const waiterOrders = filteredOrders.filter(
    (order) => normalize(order.orderType) === "WAITER"
  );

  const qrOrders = filteredOrders.filter(
    (order) => normalize(order.orderType) === "QR"
  );

  const paymentBreakdown = useMemo(() => {
    const methods = ["CASH", "CARD", "BKASH", "NAGAD", "ROCKET"];

    return methods.map((method) => {
      const amount = paidPayments
        .filter((payment) => paymentMethod(payment) === method)
        .reduce((sum, payment) => sum + numberValue(payment.amount), 0);

      return {
        method,
        amount,
        percentage: paidAmount > 0 ? (amount / paidAmount) * 100 : 0,
      };
    });
  }, [paidPayments, paidAmount]);

  const salesPoints: SalesPoint[] = useMemo(() => {
    const now = new Date();
    let dates: Date[] = [];

    if (period === "Today") {
      dates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));
        date.setHours(0, 0, 0, 0);
        return date;
      });
    } else if (period === "This Week") {
      const monday = new Date(now);
      const day = monday.getDay();
      monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);

      dates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return date;
      });
    } else {
      const start =
        period === "Previous Month"
          ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
          : new Date(now.getFullYear(), now.getMonth(), 1);

      const end =
        period === "Previous Month"
          ? new Date(now.getFullYear(), now.getMonth(), 1)
          : new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const totalDays = Math.round(
        (end.getTime() - start.getTime()) / 86400000
      );

      // Show every day in the selected month.
      dates = Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
      });
    }

    return dates.map((date) => {
      const value = salesOrders
        .filter((order) => {
          const created = orderDate(order);
          return (
            created &&
            created.getFullYear() === date.getFullYear() &&
            created.getMonth() === date.getMonth() &&
            created.getDate() === date.getDate()
          );
        })
        .reduce((sum, order) => sum + orderAmount(order), 0);

      return {
        label:
          period === "Today" || period === "This Week"
            ? date.toLocaleDateString("en-US", { weekday: "short" })
            : String(date.getDate()),
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

      items.forEach((entry) => {
        const item =
          entry.menuItem ||
          menuItems.find(
            (menu) => menu.id === Number(entry.menuItemId)
          );

        if (!item) return;

        const quantity = numberValue(entry.quantity) || 1;
        const existing = counts.get(item.id);

        if (existing) {
          existing.quantity += quantity;
        } else {
          counts.set(item.id, { item, quantity });
        }
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [salesOrders, menuItems]);

  const categoryBreakdown = useMemo(() => {
    const categories = new Map<string, number>();

    menuItems.forEach((item) => {
      const category = getCategory(item);
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [menuItems]);

  const activeStaff = staff.filter(
    (member) => normalize(member.status) === "ACTIVE"
  ).length;

  const roleBreakdown = useMemo(() => {
    const roles = ["ADMIN", "MANAGER", "WAITER", "CASHIER", "KITCHEN"];

    return roles.map((role) => ({
      role,
      count: staff.filter(
        (member) => normalize(member.role) === role
      ).length,
    }));
  }, [staff]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            (orderDate(b)?.getTime() || 0) -
            (orderDate(a)?.getTime() || 0)
        )
        .slice(0, 7),
    [orders]
  );

  const periodLabel: Record<Period, string> = {
    Today: "today",
    "This Week": "this week",
    "This Month": "this month",
    "Previous Month": "previous month",
  };

  const collectionRate =
    paidAmount + pendingAmount > 0
      ? (paidAmount / (paidAmount + pendingAmount)) * 100
      : 0;

  const formatTime = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadingBlock = (
    <div className="animate-pulse space-y-3">
      <div className="h-3 w-2/3 rounded bg-slate-100" />
      <div className="h-8 w-1/2 rounded bg-slate-100" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-6 xl:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Restaurant Management
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Restaurant Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Business performance and restaurant operations for{" "}
              {periodLabel[period]}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <select
                aria-label="Select dashboard period"
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value as Period)
                }
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Previous Month">Previous Month</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <div
              title={`${pendingPayments.length} pending payments`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
            >
              <Bell className="h-4 w-4" />
              {pendingPayments.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Some dashboard data could not be loaded
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-red-600">
                {error}
              </p>
              <p className="mt-2 text-xs text-red-600">
                If you see a CORS error, allow your deployed frontend origin
                in the backend CORS configuration.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total Sales"
            value={loading ? "—" : currency(totalSales)}
            subtitle={`Sales for ${periodLabel[period]}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={`${Math.abs(salesChange).toFixed(1)}%`}
            positive={salesChange >= 0}
          />
          <MetricCard
            title="Total Orders"
            value={loading ? "—" : totalOrders.toLocaleString("en-BD")}
            subtitle={`Orders for ${periodLabel[period]}`}
            icon={<ShoppingBag className="h-5 w-5" />}
            trend={`${Math.abs(orderChange).toFixed(1)}%`}
            positive={orderChange >= 0}
          />
          <MetricCard
            title="Average Order"
            value={loading ? "—" : currency(averageOrder)}
            subtitle="Sales divided by all orders"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            title="Paid Revenue"
            value={loading ? "—" : currency(paidAmount)}
            subtitle={`${paidPayments.length} paid payments`}
            icon={<WalletCards className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Payments"
            value={loading ? "—" : currency(pendingAmount)}
            subtitle={`${pendingPayments.length} pending payments`}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
          <Panel
            title="Sales Overview"
            subtitle={`Daily sales distribution for ${periodLabel[period]}`}
            icon={<BarChart3 className="h-5 w-5" />}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Total sales</span>
              <span className="text-lg font-bold text-slate-900">
                {currency(totalSales)}
              </span>
            </div>

            <div className="relative h-[270px]">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((line) => (
                  <div
                    key={line}
                    className="border-t border-dashed border-slate-100"
                  />
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-7 top-2 flex items-end gap-1.5 overflow-x-auto px-1 sm:gap-2">
                {salesPoints.map((point, index) => {
                  const height =
                    point.value > 0
                      ? Math.max(4, (point.value / chartMax) * 100)
                      : 1;

                  return (
                    <div
                      key={`${point.label}-${index}`}
                      title={`${point.label}: ${currency(point.value)}`}
                      className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div
                        className="mx-auto w-full max-w-[54px] rounded-t-md bg-slate-800 transition-colors group-hover:bg-emerald-600"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex gap-1 overflow-hidden px-1">
                {salesPoints.map((point, index) => (
                  <span
                    key={`${point.label}-axis-${index}`}
                    className="min-w-0 flex-1 truncate text-center text-[10px] text-slate-400"
                  >
                    {point.label}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Hover over a bar to view its sales amount.
            </p>
          </Panel>

          <Panel
            title="Order Status"
            subtitle="Orders in the selected period"
            icon={<ShoppingBag className="h-5 w-5" />}
          >
            <div className="space-y-4">
              {[
                { key: "PENDING", label: "Pending", icon: AlertCircle },
                { key: "PREPARING", label: "Preparing", icon: ChefHat },
                { key: "READY", label: "Ready", icon: CheckCircle2 },
                { key: "SERVED", label: "Served", icon: ShoppingBag },
                { key: "COMPLETED", label: "Completed", icon: CheckCircle2 },
                { key: "CANCELLED", label: "Cancelled", icon: XCircle },
              ].map(({ key, label, icon: Icon }) => {
                const count = filteredOrders.filter(
                  (order) => normalize(order.status) === key
                ).length;

                const percentage =
                  totalOrders > 0 ? (count / totalOrders) * 100 : 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {count}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            title="Table Status"
            subtitle="Current floor occupancy"
            icon={<Table2 className="h-5 w-5" />}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center sm:p-4">
                <p className="text-2xl font-bold text-emerald-700">
                  {tables.length === 0 && loading ? "—" : availableTables}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                  Available
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center sm:p-4">
                <p className="text-2xl font-bold text-amber-700">
                  {tables.length === 0 && loading ? "—" : occupiedTables}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-amber-600">
                  Occupied
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3 text-center sm:p-4">
                <p className="text-2xl font-bold text-violet-700">
                  {tables.length === 0 && loading ? "—" : reservedTables}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-violet-600">
                  Reserved
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Total tables</span>
              <span className="text-sm font-bold text-slate-900">
                {tables.length}
              </span>
            </div>
          </Panel>

          <Panel
            title="Payment Breakdown"
            subtitle="Paid revenue by method"
            icon={<CreditCard className="h-5 w-5" />}
          >
            <div className="space-y-4">
              {paymentBreakdown.map((payment) => (
                <div key={payment.method}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-600">
                      {payment.method}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currency(payment.amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{
                        width: `${Math.min(payment.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Order Channels"
            subtitle="Waiter vs QR ordering"
            icon={<ShoppingBag className="h-5 w-5" />}
          >
            {[
              {
                label: "Waiter Orders",
                count: waiterOrders.length,
                color: "bg-slate-800",
              },
              {
                label: "QR Orders",
                count: qrOrders.length,
                color: "bg-emerald-500",
              },
            ].map((channel) => (
              <div className="mb-5" key={channel.label}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    {channel.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {channel.count}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${channel.color}`}
                    style={{
                      width: `${
                        totalOrders > 0
                          ? (channel.count / totalOrders) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[11px] text-slate-400">Active orders</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {activeOrders.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Cancelled</p>
                <p className="mt-1 text-xl font-bold text-red-600">
                  {cancelledOrders}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Panel
            title="Menu Performance"
            subtitle="Best-selling items and menu distribution"
            icon={<Package className="h-5 w-5" />}
          >
            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Top Selling Items
                </p>

                {topMenuItems.length > 0 ? (
                  <div className="space-y-4">
                    {topMenuItems.map((entry, index) => (
                      <div
                        key={entry.item.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {entry.item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {getCategory(entry.item)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-slate-700">
                          {entry.quantity} sold
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                    No item sales data available for this period.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Menu Categories
                  </p>
                  <span className="text-xs font-semibold text-slate-500">
                    {menuItems.length} items
                  </span>
                </div>

                {categoryBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {categoryBreakdown.map(([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="truncate text-sm font-medium text-slate-700">
                          {category}
                        </span>
                        <span className="shrink-0 text-xs font-bold text-slate-500">
                          {count} items
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No menu categories available.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-400">Available</p>
                    <p className="mt-1 text-lg font-bold text-emerald-600">
                      {
                        menuItems.filter(
                          (item) => item.isAvailable !== false
                        ).length
                      }
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-400">Unavailable</p>
                    <p className="mt-1 text-lg font-bold text-red-600">
                      {
                        menuItems.filter(
                          (item) => item.isAvailable === false
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Kitchen Overview"
            subtitle="Current kitchen workload"
            icon={<ChefHat className="h-5 w-5" />}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-amber-50 p-3 sm:p-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="mt-3 text-2xl font-bold text-amber-700">
                  {kitchenPending}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-amber-600">
                  Pending
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 sm:p-4">
                <ChefHat className="h-4 w-4 text-blue-600" />
                <p className="mt-3 text-2xl font-bold text-blue-700">
                  {kitchenPreparing}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-blue-600">
                  Preparing
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 sm:p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="mt-3 text-2xl font-bold text-emerald-700">
                  {kitchenReady}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                  Ready
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Kitchen workload
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Pending, preparing and ready orders
                  </p>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {kitchenPending + kitchenPreparing + kitchenReady}
                </span>
              </div>

              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
                {[
                  {
                    count: kitchenPending,
                    color: "bg-amber-400",
                  },
                  {
                    count: kitchenPreparing,
                    color: "bg-blue-500",
                  },
                  {
                    count: kitchenReady,
                    color: "bg-emerald-500",
                  },
                ].map((segment, index) => (
                  <div
                    key={index}
                    className={segment.color}
                    style={{
                      width: `${
                        activeOrders.length > 0
                          ? (segment.count / activeOrders.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] text-slate-400">Menu items</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {menuItems.length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] text-slate-400">Active staff</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {activeStaff}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Staff Overview"
            subtitle="Registered team composition"
            icon={<Users className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {roleBreakdown.map((role) => (
                <div
                  key={role.role}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {role.role}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {role.count}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Total registered users
              </span>
              <span className="text-sm font-bold text-slate-900">
                {staff.length}
              </span>
            </div>
          </Panel>

          <Panel
            title="Payment Alerts"
            subtitle="Payment collection summary"
            icon={<WalletCards className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">
                  Pending Payments
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-800">
                  {pendingPayments.length}
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  {currency(pendingAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  Paid Payments
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-800">
                  {paidPayments.length}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {currency(paidAmount)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Payment collection rate
              </span>
              <span className="text-sm font-bold text-slate-900">
                {collectionRate.toFixed(1)}%
              </span>
            </div>
          </Panel>
        </div>

        <Panel
          title="Recent Orders"
          subtitle="Latest restaurant activity"
          icon={<Clock3 className="h-5 w-5" />}
        >
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Order", "Table", "Channel", "Amount", "Status", "Time"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4 text-sm font-bold text-slate-800">
                        {orderLabel(order)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {order.table?.tableNumber
                          ? `T-${order.table.tableNumber}`
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {orderChannel(order)}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">
                        {currency(orderAmount(order))}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                            order.status
                          )}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatTime(order.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ShoppingBag className="mx-auto h-8 w-8 text-slate-200" />
                      <p className="mt-3 text-sm font-medium text-slate-500">
                        {loading
                          ? "Loading orders..."
                          : "No orders available."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Loading dashboard data...
            </div>
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Table occupancy",
              value:
                tables.length > 0
                  ? `${Math.round((occupiedTables / tables.length) * 100)}%`
                  : "0%",
              icon: <Table2 className="h-4 w-4 text-slate-600" />,
            },
            {
              label: "Kitchen queue",
              value: String(kitchenPending + kitchenPreparing),
              icon: <ChefHat className="h-4 w-4 text-slate-600" />,
            },
            {
              label: "Active staff",
              value: String(activeStaff),
              icon: <Users className="h-4 w-4 text-slate-600" />,
            },
            {
              label: "Payment collection",
              value: `${Math.round(collectionRate)}%`,
              icon: <CreditCard className="h-4 w-4 text-slate-600" />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">{item.label}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pb-2 text-center text-[11px] text-slate-400">
          Restaurant POS · All amounts displayed in Bangladeshi Taka (BDT).
        </div>
      </div>
    </div>
  );
}

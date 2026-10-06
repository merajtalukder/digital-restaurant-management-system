import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
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

const API_URL = "http://localhost:3000";

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
  orderItems?: OrderItem[];
  items?: OrderItem[];
}

interface OrderItem {
  id?: number;
  quantity?: number | string;
  menuItemId?: number;
  menuItem?: MenuItem;
}

interface MenuItem {
  id: number;
  name: string;
  price?: number | string;
  isAvailable?: boolean;
  category?: {
    id?: number;
    name?: string;
  };
}

interface RestaurantTable {
  id: number;
  tableNumber?: string;
  status?: string;
}

interface Payment {
  id: number;
  amount?: number | string;
  method?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
}

interface Staff {
  id: number;
  name?: string;
  role?: string;
  status?: string;
}

interface MetricProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

const formatCurrency = (value: number) =>
  `৳${Math.round(value).toLocaleString("en-BD")}`;

const numberValue = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalize = (value?: string) =>
  String(value || "").trim().toUpperCase();

const orderDate = (order: Order) => {
  if (!order.createdAt) return null;

  const date = new Date(order.createdAt);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isInPeriod = (date: Date | null, period: Period) => {
  if (!date) return false;

  const now = new Date();

  if (period === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (period === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - mondayOffset);

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

const previousPeriod = (period: Period) => {
  const now = new Date();

  if (period === "Today") {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);

    return {
      start: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ),
      end: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      ),
    };
  }

  if (period === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - mondayOffset);

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 7);

    return {
      start: previousStart,
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

const isInRange = (
  date: Date | null,
  start: Date,
  end: Date
) => {
  if (!date) return false;

  return date >= start && date < end;
};

const getOrderAmount = (order: Order) =>
  numberValue(order.totalAmount);

const getPaymentMethod = (payment: Payment) =>
  normalize(payment.paymentMethod || payment.method);

const getTableStatus = (table: RestaurantTable) =>
  normalize(table.status);

const getOrderStatus = (order: Order) =>
  normalize(order.status);

const getOrderType = (order: Order) =>
  normalize(order.orderType);

const getCategoryName = (item: MenuItem) =>
  item.category?.name || "Uncategorized";

const getStatusLabel = (status?: string) => {
  const value = normalize(status);

  const labels: Record<string, string> = {
    PENDING: "Pending",
    PREPARING: "Preparing",
    READY: "Ready",
    SERVED: "Served",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return labels[value] || value || "Unknown";
};

const statusStyle = (status?: string) => {
  const value = normalize(status);

  if (value === "COMPLETED") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (value === "READY") {
    return "border-green-100 bg-green-50 text-green-700";
  }

  if (value === "PREPARING") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (value === "PENDING") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (value === "CANCELLED") {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (value === "SERVED") {
    return "border-violet-100 bg-violet-50 text-violet-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
};

const MetricCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: MetricProps) => {
  const hasTrend = typeof trend === "number";
  const positive = (trend || 0) >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-slate-400">
          {description}
        </p>

        {hasTrend && (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 text-xs font-bold ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default function POSOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [period, setPeriod] = useState<Period>("Today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const endpoints = [
        `${API_URL}/orders`,
        `${API_URL}/tables`,
        `${API_URL}/menu-items`,
        `${API_URL}/payments`,
        `${API_URL}/users`,
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) => fetch(endpoint))
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("Dashboard APIs returned an error.");
      }

      const data = await Promise.all(
        responses.map((response) => response.json())
      );

      setOrders(Array.isArray(data[0]) ? data[0] : []);
      setTables(Array.isArray(data[1]) ? data[1] : []);
      setMenuItems(Array.isArray(data[2]) ? data[2] : []);
      setPayments(Array.isArray(data[3]) ? data[3] : []);
      setStaff(Array.isArray(data[4]) ? data[4] : []);
    } catch (err) {
      console.error("POS overview error:", err);
      setError(
        "Unable to load dashboard data. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        isInPeriod(orderDate(order), period)
      ),
    [orders, period]
  );

  const previousOrders = useMemo(() => {
    const { start, end } = previousPeriod(period);

    return orders.filter((order) =>
      isInRange(orderDate(order), start, end)
    );
  }, [orders, period]);

  const salesOrders = useMemo(
    () =>
      filteredOrders.filter(
        (order) => getOrderStatus(order) !== "CANCELLED"
      ),
    [filteredOrders]
  );

  const totalSales = useMemo(
    () =>
      salesOrders.reduce(
        (sum, order) => sum + getOrderAmount(order),
        0
      ),
    [salesOrders]
  );

  const previousSales = useMemo(
    () =>
      previousOrders
        .filter(
          (order) => getOrderStatus(order) !== "CANCELLED"
        )
        .reduce(
          (sum, order) => sum + getOrderAmount(order),
          0
        ),
    [previousOrders]
  );

  const totalOrders = filteredOrders.length;

  const previousOrderCount = previousOrders.length;

  const salesTrend =
    previousSales > 0
      ? ((totalSales - previousSales) / previousSales) * 100
      : totalSales > 0
      ? 100
      : 0;

  const orderTrend =
    previousOrderCount > 0
      ? ((totalOrders - previousOrderCount) /
          previousOrderCount) *
        100
      : totalOrders > 0
      ? 100
      : 0;

  const averageOrder =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  const periodPayments = useMemo(
    () =>
      payments.filter((payment) =>
        isInPeriod(
          payment.createdAt
            ? new Date(payment.createdAt)
            : null,
          period
        )
      ),
    [payments, period]
  );

  const paidPayments = periodPayments.filter(
    (payment) => normalize(payment.status) === "PAID"
  );

  const pendingPayments = periodPayments.filter(
    (payment) => normalize(payment.status) === "PENDING"
  );

  const failedPayments = periodPayments.filter(
    (payment) => normalize(payment.status) === "FAILED"
  );

  const paidAmount = paidPayments.reduce(
    (sum, payment) => sum + numberValue(payment.amount),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + numberValue(payment.amount),
    0
  );

  const occupiedTables = tables.filter(
    (table) => getTableStatus(table) === "OCCUPIED"
  ).length;

  const availableTables = tables.filter(
    (table) => getTableStatus(table) === "AVAILABLE"
  ).length;

  const reservedTables = tables.filter(
    (table) => getTableStatus(table) === "RESERVED"
  ).length;

  const pendingOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "PENDING"
  ).length;

  const preparingOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "PREPARING"
  ).length;

  const readyOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "READY"
  ).length;

  const servedOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "SERVED"
  ).length;

  const completedOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "COMPLETED"
  ).length;

  const cancelledOrders = filteredOrders.filter(
    (order) => getOrderStatus(order) === "CANCELLED"
  ).length;

  const waiterOrders = filteredOrders.filter(
    (order) => getOrderType(order) === "WAITER"
  ).length;

  const qrOrders = filteredOrders.filter(
    (order) => getOrderType(order) === "QR"
  ).length;

  const paymentBreakdown = useMemo(() => {
    const methods = [
      "CASH",
      "CARD",
      "BKASH",
      "NAGAD",
      "ROCKET",
    ];

    return methods.map((method) => {
      const amount = paidPayments
        .filter(
          (payment) => getPaymentMethod(payment) === method
        )
        .reduce(
          (sum, payment) => sum + numberValue(payment.amount),
          0
        );

      return {
        method,
        amount,
        percentage:
          paidAmount > 0 ? (amount / paidAmount) * 100 : 0,
      };
    });
  }, [paidPayments, paidAmount]);

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "Today") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));

        const value = salesOrders
          .filter((order) => {
            const dateValue = orderDate(order);

            return (
              dateValue &&
              dateValue.toDateString() ===
                date.toDateString()
            );
          })
          .reduce(
            (sum, order) => sum + getOrderAmount(order),
            0
          );

        return {
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value,
        };
      });
    }

    if (period === "This Week") {
      const today = new Date(now);
      const day = today.getDay();
      const mondayOffset = day === 0 ? 6 : day - 1;

      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(
          now.getDate() - mondayOffset + index
        );

        const value = salesOrders
          .filter((order) => {
            const dateValue = orderDate(order);

            return (
              dateValue &&
              dateValue.toDateString() ===
                date.toDateString()
            );
          })
          .reduce(
            (sum, order) => sum + getOrderAmount(order),
            0
          );

        return {
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value,
        };
      });
    }

    const targetMonth =
      period === "Previous Month"
        ? now.getMonth() - 1
        : now.getMonth();

    const totalDays =
      period === "Previous Month"
        ? new Date(
            now.getFullYear(),
            now.getMonth(),
            0
          ).getDate()
        : now.getDate();

    const pointCount = Math.min(totalDays, 7);
    const startDay = Math.max(
      1,
      totalDays - pointCount + 1
    );

    return Array.from({ length: pointCount }, (_, index) => {
      const dayNumber = startDay + index;

      const date = new Date(
        now.getFullYear(),
        targetMonth,
        dayNumber
      );

      const value = salesOrders
        .filter((order) => {
          const dateValue = orderDate(order);

          return (
            dateValue &&
            dateValue.getFullYear() ===
              date.getFullYear() &&
            dateValue.getMonth() === date.getMonth() &&
            dateValue.getDate() === date.getDate()
          );
        })
        .reduce(
          (sum, order) => sum + getOrderAmount(order),
          0
        );

      return {
        label: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        value,
      };
    });
  }, [salesOrders, period]);

  const chartMax = Math.max(
    ...chartData.map((point) => point.value),
    1
  );

  const topSellingItems = useMemo(() => {
    const result = new Map<
      number,
      {
        item: MenuItem;
        quantity: number;
      }
    >();

    salesOrders.forEach((order) => {
      const items =
        order.orderItems || order.items || [];

      items.forEach((orderItem) => {
        const item =
          orderItem.menuItem ||
          menuItems.find(
            (menuItem) =>
              menuItem.id ===
              Number(orderItem.menuItemId)
          );

        if (!item) return;

        const quantity =
          numberValue(orderItem.quantity) || 1;

        const existing = result.get(item.id);

        if (existing) {
          existing.quantity += quantity;
        } else {
          result.set(item.id, {
            item,
            quantity,
          });
        }
      });
    });

    return Array.from(result.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [salesOrders, menuItems]);

  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();

    menuItems.forEach((item) => {
      const category = getCategoryName(item);

      categories.set(
        category,
        (categories.get(category) || 0) + 1
      );
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [menuItems]);

  const activeStaff = staff.filter(
    (member) => normalize(member.status) === "ACTIVE"
  ).length;

  const roleData = ["ADMIN", "WAITER", "CASHIER", "KITCHEN"].map(
    (role) => ({
      role,
      count: staff.filter(
        (member) => normalize(member.role) === role
      ).length,
    })
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            (orderDate(b)?.getTime() || 0) -
            (orderDate(a)?.getTime() || 0)
        )
        .slice(0, 8),
    [orders]
  );

  const formatTime = (date?: string) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "—";

    return value.toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOrderType = (type?: string) => {
    const value = normalize(type);

    if (value === "QR") return "QR Order";
    if (value === "WAITER") return "Waiter";

    return value || "Order";
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Restaurant is open
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              POS Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor sales, orders, payments and restaurant
              operations from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-400" />

              <select
                value={period}
                onChange={(event) =>
                  setPeriod(
                    event.target.value as Period
                  )
                }
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
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
              onClick={() =>
                fetchDashboardData(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-800">
                Dashboard data unavailable
              </p>

              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total Sales"
            value={
              loading
                ? "—"
                : formatCurrency(totalSales)
            }
            description="Revenue for selected period"
            icon={
              <DollarSign className="h-5 w-5" />
            }
            trend={salesTrend}
          />

          <MetricCard
            title="Total Orders"
            value={
              loading
                ? "—"
                : totalOrders.toLocaleString()
            }
            description="Orders received"
            icon={
              <ShoppingBag className="h-5 w-5" />
            }
            trend={orderTrend}
          />

          <MetricCard
            title="Average Order"
            value={
              loading
                ? "—"
                : formatCurrency(averageOrder)
            }
            description="Average ticket value"
            icon={
              <BarChart3 className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Paid Revenue"
            value={
              loading
                ? "—"
                : formatCurrency(paidAmount)
            }
            description={`${paidPayments.length} paid payments`}
            icon={
              <WalletCards className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Pending Payments"
            value={
              loading
                ? "—"
                : formatCurrency(pendingAmount)
            }
            description={`${pendingPayments.length} awaiting payment`}
            icon={
              <Clock3 className="h-5 w-5" />
            }
          />
        </section>

        {/* Sales + Order Status */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sales Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Revenue trend for the selected period
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Revenue
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {formatCurrency(totalSales)}
                </p>
              </div>
            </div>

            <div className="mt-8 h-[280px]">
              <div className="relative h-full">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-slate-100"
                    />
                  ))}
                </div>

                <div className="absolute inset-x-0 bottom-8 top-2 flex items-end gap-2 px-1 sm:gap-4">
                  {chartData.map(
                    (point, index) => {
                      const height =
                        point.value > 0
                          ? Math.max(
                              6,
                              (point.value /
                                chartMax) *
                                100
                            )
                          : 2;

                      return (
                        <div
                          key={`${point.label}-${index}`}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            className="mx-auto w-full max-w-[58px] rounded-t-xl bg-slate-900 transition-all duration-300 group-hover:bg-slate-700"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg group-hover:block">
                            {formatCurrency(point.value)}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-1 sm:gap-4">
                  {chartData.map(
                    (point, index) => (
                      <span
                        key={`${point.label}-axis-${index}`}
                        className="flex-1 text-center text-[10px] font-semibold text-slate-400"
                      >
                        {point.label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Order Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current order distribution
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Pending",
                  value: pendingOrders,
                  icon: (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  ),
                },
                {
                  label: "Preparing",
                  value: preparingOrders,
                  icon: (
                    <ChefHat className="h-4 w-4 text-blue-600" />
                  ),
                },
                {
                  label: "Ready",
                  value: readyOrders,
                  icon: (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ),
                },
                {
                  label: "Served",
                  value: servedOrders,
                  icon: (
                    <ShoppingBag className="h-4 w-4 text-violet-600" />
                  ),
                },
                {
                  label: "Completed",
                  value: completedOrders,
                  icon: (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ),
                },
                {
                  label: "Cancelled",
                  value: cancelledOrders,
                  icon: (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ),
                },
              ].map((item) => {
                const percentage =
                  totalOrders > 0
                    ? (item.value / totalOrders) *
                      100
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.icon}

                        <span className="text-xs font-semibold text-slate-600">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        {item.value}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tables / Payments / Channels */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Tables */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Table Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current floor occupancy
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Table2 className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">
                  {availableTables}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Available
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {occupiedTables}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Occupied
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-4 text-center">
                <p className="text-2xl font-bold text-violet-700">
                  {reservedTables}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-violet-600">
                  Reserved
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">
                Total tables
              </span>

              <span className="text-sm font-bold text-slate-900">
                {tables.length}
              </span>
            </div>
          </div>

          {/* Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Breakdown
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Paid revenue by method
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <CreditCard className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {paymentBreakdown.map(
                (payment) => (
                  <div key={payment.method}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        {payment.method}
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{
                          width: `${Math.min(
                            payment.percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Failed payments
                </span>

                <span className="text-sm font-bold text-red-600">
                  {failedPayments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Order Channels
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Waiter and QR order performance
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <ShoppingBag className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Waiter Orders
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {waiterOrders}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width: `${
                        totalOrders > 0
                          ? (waiterOrders /
                              totalOrders) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    QR Orders
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {qrOrders}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-500"
                    style={{
                      width: `${
                        totalOrders > 0
                          ? (qrOrders /
                              totalOrders) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Active Orders
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {
                      filteredOrders.filter(
                        (order) =>
                          [
                            "PENDING",
                            "PREPARING",
                            "READY",
                            "SERVED",
                          ].includes(
                            getOrderStatus(order)
                          )
                      ).length
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Cancelled
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-600">
                    {cancelledOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu + Kitchen */}
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
          {/* Menu Performance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Menu Performance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Best-selling items and menu availability
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Package className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 grid gap-7 md:grid-cols-2">
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Top Selling Items
                </p>

                <div className="space-y-3">
                  {topSellingItems.length > 0 ? (
                    topSellingItems.map(
                      (entry, index) => (
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

                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {getCategoryName(
                                entry.item
                              )}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-slate-600">
                            {entry.quantity} sold
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">
                        No item sales data available.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Menu Overview
                  </p>

                  <span className="text-xs font-bold text-slate-500">
                    {menuItems.length} items
                  </span>
                </div>

                <div className="space-y-2.5">
                  {categoryData.length > 0 ? (
                    categoryData.map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <span className="truncate pr-3 text-xs font-semibold text-slate-700">
                            {category}
                          </span>

                          <span className="shrink-0 text-xs font-bold text-slate-500">
                            {count}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">
                        No category data available.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-[10px] font-semibold text-emerald-600">
                      Available
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-700">
                      {
                        menuItems.filter(
                          (item) =>
                            item.isAvailable !==
                            false
                        ).length
                      }
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-[10px] font-semibold text-red-600">
                      Unavailable
                    </p>

                    <p className="mt-1 text-xl font-bold text-red-700">
                      {
                        menuItems.filter(
                          (item) =>
                            item.isAvailable ===
                            false
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kitchen */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Kitchen Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Live kitchen workload
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <ChefHat className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-amber-50 p-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />

                <p className="mt-3 text-2xl font-bold text-amber-700">
                  {pendingOrders}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Pending
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <ChefHat className="h-4 w-4 text-blue-600" />

                <p className="mt-3 text-2xl font-bold text-blue-700">
                  {preparingOrders}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  Preparing
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                <p className="mt-3 text-2xl font-bold text-emerald-700">
                  {readyOrders}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Ready
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Kitchen Queue
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Orders currently requiring kitchen attention
                  </p>
                </div>

                <span className="text-xl font-bold text-slate-900">
                  {pendingOrders +
                    preparingOrders}
                </span>
              </div>

              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-amber-400"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (pendingOrders /
                            filteredOrders.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

                <div
                  className="bg-blue-500"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (preparingOrders /
                            filteredOrders.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

                <div
                  className="bg-emerald-500"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (readyOrders /
                            filteredOrders.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Staff + Payment Summary */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Staff Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current team composition
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {roleData.map((role) => (
                <div
                  key={role.role}
                  className="rounded-xl bg-slate-50 p-4"
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
              <span className="text-xs text-slate-400">
                Active staff
              </span>

              <span className="text-sm font-bold text-emerald-600">
                {activeStaff}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Collection
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current payment collection health
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <WalletCards className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Paid
                </p>

                <p className="mt-2 text-xl font-bold text-emerald-700">
                  {paidPayments.length}
                </p>

                <p className="mt-1 truncate text-[10px] text-emerald-600">
                  {formatCurrency(paidAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Pending
                </p>

                <p className="mt-2 text-xl font-bold text-amber-700">
                  {pendingPayments.length}
                </p>

                <p className="mt-1 truncate text-[10px] text-amber-600">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                  Failed
                </p>

                <p className="mt-2 text-xl font-bold text-red-700">
                  {failedPayments.length}
                </p>

                <p className="mt-1 text-[10px] text-red-600">
                  Requires attention
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Collection rate
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {paidAmount + pendingAmount > 0
                    ? `${(
                        (paidAmount /
                          (paidAmount +
                            pendingAmount)) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${
                      paidAmount + pendingAmount > 0
                        ? Math.min(
                            (paidAmount /
                              (paidAmount +
                                pendingAmount)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest restaurant activity
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-slate-500">
                Live data
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Table
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Channel
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          {order.orderNumber ||
                            `#${order.id}`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {order.table?.tableNumber
                            ? `T-${order.table.tableNumber}`
                            : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {formatOrderType(
                            order.orderType
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(
                            getOrderAmount(order)
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-500">
                          {formatTime(
                            order.createdAt
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <ShoppingBag className="mx-auto h-8 w-8 text-slate-200" />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No orders available.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Final summary */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <Table2 className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Table Occupancy
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {tables.length > 0
                    ? `${Math.round(
                        (occupiedTables /
                          tables.length) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <ChefHat className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Kitchen Queue
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {pendingOrders +
                    preparingOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <Users className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Active Staff
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {activeStaff}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <CreditCard className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Collection Rate
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {paidAmount + pendingAmount > 0
                    ? `${Math.round(
                        (paidAmount /
                          (paidAmount +
                            pendingAmount)) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000";

type ReportPeriod =
  | "Today"
  | "This Week"
  | "This Month";

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

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch orders."
        );
      }

      const data = await response.json();

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

  // =========================
  // LOAD ORDERS
  // =========================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // PERIOD FILTER
  // =========================

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const orderDate =
        new Date(order.createdAt);

      if (period === "Today") {
        return (
          orderDate.getDate() ===
            now.getDate() &&
          orderDate.getMonth() ===
            now.getMonth() &&
          orderDate.getFullYear() ===
            now.getFullYear()
        );
      }

      if (period === "This Week") {
        const startOfWeek =
          new Date(now);

        const day =
          startOfWeek.getDay();

        const difference =
          day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() -
            difference
        );

        startOfWeek.setHours(
          0,
          0,
          0,
          0
        );

        return orderDate >= startOfWeek;
      }

      if (period === "This Month") {
        return (
          orderDate.getMonth() ===
            now.getMonth() &&
          orderDate.getFullYear() ===
            now.getFullYear()
        );
      }

      return true;
    });
  }, [orders, period]);

  // =========================
  // COMPLETED ORDERS
  // =========================

  const completedOrders =
    filteredOrders.filter(
      (order) =>
        order.status === "COMPLETED"
    );

  // =========================
  // CANCELLED ORDERS
  // =========================

  const cancelledOrders =
    filteredOrders.filter(
      (order) =>
        order.status === "CANCELLED"
    );

  // =========================
  // TOTAL SALES
  // =========================

  const totalSales =
    completedOrders.reduce(
      (sum, order) =>
        sum +
        Number(order.totalAmount),
      0
    );

  // =========================
  // TOTAL ORDERS
  // =========================

  const totalOrders =
    filteredOrders.length;

  // =========================
  // AVERAGE ORDER
  // =========================

  const averageOrder =
    completedOrders.length > 0
      ? totalSales /
        completedOrders.length
      : 0;

  // =========================
  // PAID ORDERS
  // =========================

  const paidOrders =
    filteredOrders.filter(
      (order) =>
        order.payment?.status ===
        "PAID"
    );

  // =========================
  // WAITER SALES
  // =========================

  const waiterSales =
    completedOrders
      .filter(
        (order) =>
          order.orderType ===
          "WAITER"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(order.totalAmount),
        0
      );

  // =========================
  // QR SALES
  // =========================

  const qrSales =
    completedOrders
      .filter(
        (order) =>
          order.orderType ===
          "QR"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(order.totalAmount),
        0
      );

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (
    amount: number
  ) => {
    return `৳${amount.toLocaleString(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================
  // ORDER TYPE
  // =========================

  const getOrderTypeText = (
    type: OrderType
  ) => {
    return type === "WAITER"
      ? "Waiter Order"
      : "QR Self Order";
  };

  // =========================
  // STATUS TEXT
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
  // STATUS STYLE
  // =========================

  const getStatusClass = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "PREPARING":
        return "bg-blue-100 text-blue-700";

      case "READY":
        return "bg-purple-100 text-purple-700";

      case "SERVED":
        return "bg-indigo-100 text-indigo-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // PAYMENT STATUS
  // =========================

  const getPaymentStatus = (
    order: Order
  ) => {
    return (
      order.payment?.status ??
      "PENDING"
    );
  };

  // =========================
  // PAYMENT STYLE
  // =========================

  const getPaymentClass = (
    status: PaymentStatus
  ) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "REFUNDED":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =========================
  // PAYMENT LABEL
  // =========================

  const getPaymentLabel = (
    status: PaymentStatus
  ) => {
    switch (status) {
      case "PAID":
        return "Paid";

      case "FAILED":
        return "Failed";

      case "REFUNDED":
        return "Refunded";

      case "PENDING":
        return "Pending";

      default:
        return status;
    }
  };

  // =========================
  // TABLE NUMBER
  // =========================

  const getTableNumber = (
    table?: Table | null
  ) => {
    if (!table) {
      return "N/A";
    }

    return `T-${String(
      table.tableNumber
    ).padStart(2, "0")}`;
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div className="w-full">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Reports
          </h2>

          <p className="mt-2 text-gray-600">
            View restaurant sales and order reports
          </p>
        </div>

        {/* PERIOD */}

        <select
          value={period}
          onChange={(e) =>
            setPeriod(
              e.target.value as ReportPeriod
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
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
        </select>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (

        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading reports...
        </div>

      ) : (

        <>

          {/* ================= SUMMARY ================= */}

          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL SALES */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Total Sales
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-800">
                {formatMoney(
                  totalSales
                )}
              </p>

              <p className="mt-2 text-sm text-green-600">
                From completed orders
              </p>

            </div>

            {/* TOTAL ORDERS */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Total Orders
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-800">
                {totalOrders}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {period}
              </p>

            </div>

            {/* AVERAGE ORDER */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Average Order
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-800">
                {formatMoney(
                  averageOrder
                )}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Per completed order
              </p>

            </div>

            {/* PAID ORDERS */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Paid Orders
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {paidOrders.length}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Payment completed
              </p>

            </div>

          </div>

          {/* ================= SECONDARY SUMMARY ================= */}

          <div className="mb-8 grid gap-5 md:grid-cols-3">

            {/* COMPLETED */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-gray-500">
                Completed Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {completedOrders.length}
              </p>

            </div>

            {/* CANCELLED */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-gray-500">
                Cancelled Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {cancelledOrders.length}
              </p>

            </div>

            {/* PERIOD */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-gray-500">
                Selected Period
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {period}
              </p>

            </div>

          </div>

          {/* ================= SALES BREAKDOWN ================= */}

          <div className="mb-8 grid gap-6 md:grid-cols-2">

            {/* WAITER */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-semibold text-gray-800">
                Waiter Orders
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Sales from waiter-based orders
              </p>

              <div className="mt-6">

                <p className="text-3xl font-bold text-gray-800">
                  {formatMoney(
                    waiterSales
                  )}
                </p>

              </div>

            </div>

            {/* QR */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-semibold text-gray-800">
                QR Self Orders
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Sales from QR-based customer orders
              </p>

              <div className="mt-6">

                <p className="text-3xl font-bold text-gray-800">
                  {formatMoney(
                    qrSales
                  )}
                </p>

              </div>

            </div>

          </div>

          {/* ================= ORDER REPORT ================= */}

          <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-gray-200 px-6 py-5">

              <h3 className="text-xl font-semibold text-gray-800">
                Sales & Order Details
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Order performance for{" "}
                {period.toLowerCase()}
              </p>

            </div>

            {/* TABLE */}

            <div className="w-full overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Order
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Table
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Order Type
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Total
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Payment
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.length >
                  0 ? (

                    filteredOrders.map(
                      (order) => {

                        const paymentStatus =
                          getPaymentStatus(
                            order
                          );

                        return (
                          <tr
                            key={order.id}
                            className="border-t border-gray-200"
                          >

                            {/* ORDER */}

                            <td className="px-6 py-4">

                              <p className="font-medium text-gray-800">
                                {
                                  order.orderNumber
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {formatDate(
                                  order.createdAt
                                )}
                              </p>

                            </td>

                            {/* TABLE */}

                            <td className="px-6 py-4 font-medium text-gray-700">

                              {getTableNumber(
                                order.table
                              )}

                            </td>

                            {/* TYPE */}

                            <td className="px-6 py-4">

                              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                {getOrderTypeText(
                                  order.orderType
                                )}
                              </span>

                            </td>

                            {/* TOTAL */}

                            <td className="px-6 py-4 font-semibold text-gray-800">

                              {formatMoney(
                                Number(
                                  order.totalAmount
                                )
                              )}

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                                  order.status
                                )}`}
                              >
                                {getStatusText(
                                  order.status
                                )}
                              </span>

                            </td>

                            {/* PAYMENT */}

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-sm ${getPaymentClass(
                                  paymentStatus
                                )}`}
                              >
                                {getPaymentLabel(
                                  paymentStatus
                                )}
                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No orders found for{" "}
                        {period.toLowerCase()}.
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
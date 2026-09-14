import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  Banknote,
  CreditCard,
  Search,
  X,
  CheckCircle2,
  Clock3,
  Receipt,
  Printer,
  RefreshCw,
  Smartphone,
} from "lucide-react";

type PaymentMethod =
  | "CASH"
  | "CARD"
  | "BKASH"
  | "NAGAD"
  | "ROCKET";

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

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  menuItem: MenuItem;
}

interface RestaurantTable {
  id: number;
  tableNumber: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string | null;
  orderType: "WAITER" | "QR";
  status: string;
  totalAmount: string | number;
  table: RestaurantTable;
  orderItems: OrderItem[];
}

interface Payment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string | number;
  transactionId?: string | null;
  orderId: number;
  createdAt: string;
  order: Order;
}

const formatMoney = (value: string | number) => {
  return `৳${Number(value || 0).toFixed(2)}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Cashier = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "pending" | "history"
  >("pending");

  const [search, setSearch] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [processing, setProcessing] = useState(false);

  const [invoicePayment, setInvoicePayment] =
    useState<Payment | null>(null);

  // ==========================================
  // FETCH PAYMENTS
  // ==========================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Payment[]>(
        "/payments",
      );

      setPayments(response.data);
    } catch (err: any) {
      console.error(
        "Failed to fetch payments:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load payments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ==========================================
  // PAYMENT FILTERS
  // ==========================================

  const pendingPayments = useMemo(() => {
    return payments.filter(
      (payment) => payment.status === "PENDING",
    );
  }, [payments]);

  const paidPayments = useMemo(() => {
    return payments.filter(
      (payment) => payment.status === "PAID",
    );
  }, [payments]);

  const displayedPayments = useMemo(() => {
    const source =
      activeTab === "pending"
        ? pendingPayments
        : paidPayments;

    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return source;
    }

    return source.filter((payment) => {
      const orderNumber =
        payment.order?.orderNumber?.toLowerCase() ||
        "";

      const customerName =
        payment.order?.customerName?.toLowerCase() ||
        "";

      const tableNumber = String(
        payment.order?.table?.tableNumber || "",
      );

      const transactionId =
        payment.transactionId?.toLowerCase() || "";

      return (
        orderNumber.includes(keyword) ||
        customerName.includes(keyword) ||
        tableNumber.includes(keyword) ||
        transactionId.includes(keyword)
      );
    });
  }, [
    activeTab,
    pendingPayments,
    paidPayments,
    search,
  ]);

  // ==========================================
  // TODAY'S SALES
  // ==========================================

  const todayPaidAmount = useMemo(() => {
    const today = new Date();

    return paidPayments
      .filter((payment) => {
        const date = new Date(
          payment.createdAt,
        );

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() ===
            today.getFullYear()
        );
      })
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0,
      );
  }, [paidPayments]);

  // ==========================================
  // PENDING AMOUNT
  // ==========================================

  const pendingAmount = useMemo(() => {
    return pendingPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0,
    );
  }, [pendingPayments]);

  // ==========================================
  // OPEN PAYMENT MODAL
  // ==========================================

  const openPaymentModal = (
    payment: Payment,
  ) => {
    setSelectedPayment(payment);
  };

  // ==========================================
  // RECEIVE CASH PAYMENT
  // ==========================================

  const receivePayment = async () => {
    if (!selectedPayment) {
      return;
    }

    if (
      selectedPayment.status !== "PENDING"
    ) {
      alert(
        "This payment is no longer pending.",
      );

      setSelectedPayment(null);
      return;
    }

    if (
      selectedPayment.method !== "CASH"
    ) {
      alert(
        "This payment is an online payment. It must be completed through the online payment gateway.",
      );

      return;
    }

    try {
      setProcessing(true);

      const response = await api.patch<Payment>(
        `/payments/${selectedPayment.id}/pay`,
        {
          method: "CASH",
        },
      );

      const updatedPayment =
        response.data;

      setPayments((current) =>
        current.map((payment) =>
          payment.id === updatedPayment.id
            ? updatedPayment
            : payment,
        ),
      );

      setSelectedPayment(null);

      setInvoicePayment(
        updatedPayment,
      );
    } catch (err: any) {
      console.error(
        "Payment failed:",
        err,
      );

      alert(
        err?.response?.data?.message ||
          "Failed to complete payment.",
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // PRINT INVOICE
  // ==========================================

  const printInvoice = () => {
    window.print();
  };

  // ==========================================
  // PAYMENT METHOD ICON
  // ==========================================

  const getPaymentIcon = (
    method: PaymentMethod,
  ) => {
    if (method === "CASH") {
      return (
        <Banknote className="w-4 h-4" />
      );
    }

    if (method === "CARD") {
      return (
        <CreditCard className="w-4 h-4" />
      );
    }

    return (
      <Smartphone className="w-4 h-4" />
    );
  };

  // ==========================================
  // PAYMENT METHOD LABEL
  // ==========================================

  const getPaymentMethodLabel = (
    method: PaymentMethod,
  ) => {
    if (method === "BKASH") {
      return "bKash";
    }

    if (method === "NAGAD") {
      return "Nagad";
    }

    if (method === "ROCKET") {
      return "Rocket";
    }

    if (method === "CARD") {
      return "Card";
    }

    return "Cash";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading payments...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 print:hidden">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cashier
          </h1>

          <p className="text-gray-500 mt-1">
            Receive payments and manage invoices
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 print:hidden">
          {error}
        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">

        {/* TODAY'S SALES */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Today's Sales
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {formatMoney(
                  todayPaidAmount,
                )}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-green-50">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>

          </div>
        </div>

        {/* PENDING PAYMENTS */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Payments
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {pendingPayments.length}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-yellow-50">
              <Clock3 className="w-6 h-6 text-yellow-600" />
            </div>

          </div>
        </div>

        {/* PENDING AMOUNT */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Amount
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {formatMoney(
                  pendingAmount,
                )}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-orange-50">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>

          </div>
        </div>

        {/* PAID ORDERS */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Paid Orders
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {paidPayments.length}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-blue-50">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>

          </div>
        </div>

      </div>

      {/* ======================================
          MAIN PAYMENT CARD
      ====================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden print:hidden">

        {/* TABS + SEARCH */}

        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">

            <button
              onClick={() =>
                setActiveTab("pending")
              }
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                activeTab === "pending"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Pending (
              {pendingPayments.length})
            </button>

            <button
              onClick={() =>
                setActiveTab("history")
              }
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                activeTab === "history"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Payment History (
              {paidPayments.length})
            </button>

          </div>

          <div className="relative w-full lg:w-80">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search order, customer, table..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-200"
            />

          </div>

        </div>

        {/* ======================================
            PAYMENT TABLE
        ====================================== */}

        <div className="overflow-x-auto">

          {displayedPayments.length === 0 ? (
            <div className="py-16 text-center text-gray-500">

              <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />

              {activeTab === "pending"
                ? "No pending payments."
                : "No payment history found."}

            </div>
          ) : (
            <table className="w-full">

              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">

                  <th className="px-5 py-4">
                    Order
                  </th>

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Table
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Method
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {displayedPayments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50"
                    >

                      {/* ORDER */}

                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {
                            payment.order
                              ?.orderNumber
                          }
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(
                            payment.createdAt,
                          )}
                        </div>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-5 py-4">
                        {payment.order
                          ?.customerName ||
                          "Walk-in Customer"}
                      </td>

                      {/* TABLE */}

                      <td className="px-5 py-4">
                        Table{" "}
                        {
                          payment.order
                            ?.table
                            ?.tableNumber
                        }
                      </td>

                      {/* AMOUNT */}

                      <td className="px-5 py-4 font-semibold">
                        {formatMoney(
                          payment.amount,
                        )}
                      </td>

                      {/* METHOD */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-2 text-sm">

                          {getPaymentIcon(
                            payment.method,
                          )}

                          {getPaymentMethodLabel(
                            payment.method,
                          )}

                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {payment.status ===
                        "PAID" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">

                            <CheckCircle2 className="w-3.5 h-3.5" />

                            PAID

                          </span>
                        ) : payment.status ===
                          "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">

                            <Clock3 className="w-3.5 h-3.5" />

                            PENDING

                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                            {payment.status}
                          </span>
                        )}

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">

                        {payment.status ===
                        "PENDING" ? (
                          payment.method ===
                          "CASH" ? (
                            <button
                              onClick={() =>
                                openPaymentModal(
                                  payment,
                                )
                              }
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                            >
                              Receive Payment
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Online Payment
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() =>
                              setInvoicePayment(
                                payment,
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                          >
                            <Receipt className="w-4 h-4" />
                            Invoice
                          </button>
                        )}

                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>
          )}

        </div>
      </div>

      {/* ======================================
          RECEIVE CASH PAYMENT MODAL
      ====================================== */}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            {/* MODAL HEADER */}

            <div className="p-5 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Receive Cash Payment
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {
                    selectedPayment.order
                      ?.orderNumber
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPayment(
                    null,
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-5 space-y-5">

              {/* ORDER INFO */}

              <div className="bg-gray-50 rounded-xl p-4">

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Customer
                  </span>

                  <span className="font-medium">
                    {selectedPayment.order
                      ?.customerName ||
                      "Walk-in Customer"}
                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Table
                  </span>

                  <span className="font-medium">
                    Table{" "}
                    {
                      selectedPayment
                        .order?.table
                        ?.tableNumber
                    }
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Total Amount
                  </span>

                  <span className="text-xl font-bold">
                    {formatMoney(
                      selectedPayment.amount,
                    )}
                  </span>

                </div>

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>

                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">

                  <Banknote className="w-5 h-5 text-gray-700" />

                  <div>
                    <p className="font-medium">
                      Cash
                    </p>

                    <p className="text-xs text-gray-500">
                      Manual cashier payment
                    </p>
                  </div>

                </div>

              </div>

              {/* NOTICE */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Confirm that the full amount has been received from the customer before completing the payment.
              </div>

              {/* ACTIONS */}

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setSelectedPayment(
                      null,
                    )
                  }
                  disabled={processing}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={receivePayment}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : "Confirm Payment"}
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================
          INVOICE MODAL
      ====================================== */}

      {invoicePayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:static print:bg-white print:p-0">

          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl print:shadow-none print:max-w-none">

            {/* SCREEN HEADER */}

            <div className="p-5 border-b border-gray-100 flex items-center justify-between print:hidden">

              <h2 className="text-xl font-bold">
                Invoice
              </h2>

              <button
                onClick={() =>
                  setInvoicePayment(
                    null,
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* INVOICE */}

            <div
              id="invoice"
              className="p-6"
            >

              <div className="text-center mb-6">

                <h1 className="text-2xl font-bold">
                  Restaurant POS
                </h1>

                <p className="text-sm text-gray-500">
                  Payment Invoice
                </p>

              </div>

              {/* BASIC INFORMATION */}

              <div className="border-b pb-4 mb-4 text-sm">

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Invoice
                  </span>

                  <span className="font-medium">
                    INV-{invoicePayment.id}
                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Order
                  </span>

                  <span className="font-medium">
                    {
                      invoicePayment
                        .order
                        ?.orderNumber
                    }
                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Customer
                  </span>

                  <span>
                    {invoicePayment.order
                      ?.customerName ||
                      "Walk-in Customer"}
                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-500">
                    Table
                  </span>

                  <span>
                    Table{" "}
                    {
                      invoicePayment
                        .order?.table
                        ?.tableNumber
                    }
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Date
                  </span>

                  <span>
                    {formatDate(
                      invoicePayment.createdAt,
                    )}
                  </span>

                </div>

              </div>

              {/* ITEMS */}

              <div className="space-y-3 mb-5">

                {invoicePayment.order
                  ?.orderItems?.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >

                        <div>
                          <p className="font-medium">
                            {
                              item.menuItem
                                ?.name
                            }
                          </p>

                          <p className="text-gray-500">
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {formatMoney(
                              item.unitPrice,
                            )}
                          </p>
                        </div>

                        <span className="font-medium">
                          {formatMoney(
                            item.subtotal,
                          )}
                        </span>

                      </div>
                    ),
                  )}

              </div>

              {/* TOTAL */}

              <div className="border-t pt-4">

                <div className="flex justify-between text-lg font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    {formatMoney(
                      invoicePayment.amount,
                    )}
                  </span>

                </div>

                <div className="flex justify-between text-sm mt-3">

                  <span className="text-gray-500">
                    Payment Method
                  </span>

                  <span className="font-medium">
                    {getPaymentMethodLabel(
                      invoicePayment.method,
                    )}
                  </span>

                </div>

                {invoicePayment.transactionId && (
                  <div className="flex justify-between text-sm mt-2">

                    <span className="text-gray-500">
                      Transaction ID
                    </span>

                    <span className="font-medium break-all ml-4 text-right">
                      {
                        invoicePayment
                          .transactionId
                      }
                    </span>

                  </div>
                )}

                <div className="flex justify-between text-sm mt-2">

                  <span className="text-gray-500">
                    Status
                  </span>

                  <span className="text-green-600 font-semibold">
                    PAID
                  </span>

                </div>

              </div>

              <div className="text-center mt-8 text-sm text-gray-500">
                Thank you for dining with us!
              </div>

            </div>

            {/* PRINT */}

            <div className="p-5 border-t print:hidden">

              <button
                onClick={printInvoice}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================
          PRINT CSS
      ====================================== */}

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #invoice,
            #invoice * {
              visibility: visible;
            }

            #invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

    </div>
  );
};

export default Cashier;
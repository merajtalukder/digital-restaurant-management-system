import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../../api/axios";
import jsPDF from "jspdf";
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
  Download,
  ChevronDown,
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

type SalesPeriod =
  | "today"
  | "weekly"
  | "monthly"
  | "previousMonthly";

const formatMoney = (value: string | number) => {
  return `৳${Number(value || 0).toFixed(2)}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeStatus = (
  status: PaymentStatus | string | null | undefined,
): PaymentStatus | "" => {
  return String(status || "")
    .trim()
    .toUpperCase() as PaymentStatus | "";
};

const Cashier = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "pending" | "history"
  >("pending");

  const [salesPeriod, setSalesPeriod] =
    useState<SalesPeriod>("today");

  const [search, setSearch] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [processing, setProcessing] =
    useState(false);

  const [invoicePayment, setInvoicePayment] =
    useState<Payment | null>(null);

  // ==========================================
  // FETCH PAYMENTS
  // ==========================================

  const fetchPayments = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setRefreshing(true);
        }

        setError("");

        const response = await api.get<Payment[]>(
          "/payments",
          {
            params: {
              _t: Date.now(),
            },
          },
        );

        setPayments(
          Array.isArray(response.data)
            ? response.data
            : [],
        );
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
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchPayments();
    }, 5000);

    const handleFocus = () => {
      fetchPayments();
    };

    window.addEventListener(
      "focus",
      handleFocus,
    );

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, [fetchPayments]);

  // ==========================================
  // PENDING PAYMENTS
  // ==========================================

  const pendingPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        normalizeStatus(payment.status) ===
        "PENDING",
    );
  }, [payments]);

  // ==========================================
  // PAID PAYMENTS
  // ==========================================

  const paidPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        normalizeStatus(payment.status) ===
        "PAID",
    );
  }, [payments]);

  // ==========================================
  // SEARCH
  // ==========================================

  const displayedPayments = useMemo(() => {
    const source =
      activeTab === "pending"
        ? pendingPayments
        : paidPayments;

    const keyword = search
      .trim()
      .toLowerCase();

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

      const paymentMethod =
        payment.method?.toLowerCase() || "";

      return (
        orderNumber.includes(keyword) ||
        customerName.includes(keyword) ||
        tableNumber.includes(keyword) ||
        transactionId.includes(keyword) ||
        paymentMethod.includes(keyword)
      );
    });
  }, [
    activeTab,
    pendingPayments,
    paidPayments,
    search,
  ]);

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear()
    );
  };

  const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    const startOfWeek = new Date(today);

    const day = startOfWeek.getDay();
    const difference =
      day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - difference,
    );

    startOfWeek.setHours(
      0,
      0,
      0,
      0,
    );

    const endOfWeek = new Date(
      startOfWeek,
    );

    endOfWeek.setDate(
      endOfWeek.getDate() + 7,
    );

    return (
      date >= startOfWeek &&
      date < endOfWeek
    );
  };

  const isThisMonth = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear()
    );
  };

  const isPreviousMonth = (
    dateString: string,
  ) => {
    const date = new Date(dateString);
    const today = new Date();

    const previousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );

    return (
      date.getMonth() ===
        previousMonth.getMonth() &&
      date.getFullYear() ===
        previousMonth.getFullYear()
    );
  };

  // ==========================================
  // SALES CALCULATIONS
  // ==========================================

  const todaySales = useMemo(() => {
    return paidPayments.filter((payment) =>
      isToday(payment.createdAt),
    );
  }, [paidPayments]);

  const weeklySales = useMemo(() => {
    return paidPayments.filter((payment) =>
      isThisWeek(payment.createdAt),
    );
  }, [paidPayments]);

  const monthlySales = useMemo(() => {
    return paidPayments.filter((payment) =>
      isThisMonth(payment.createdAt),
    );
  }, [paidPayments]);

  const previousMonthlySales = useMemo(() => {
    return paidPayments.filter((payment) =>
      isPreviousMonth(payment.createdAt),
    );
  }, [paidPayments]);

  const todaySalesAmount = useMemo(() => {
    return todaySales.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0,
    );
  }, [todaySales]);

  const pendingAmount = useMemo(() => {
    return pendingPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0,
    );
  }, [pendingPayments]);

  const selectedSales = useMemo(() => {
    if (salesPeriod === "today") {
      return todaySales;
    }

    if (salesPeriod === "weekly") {
      return weeklySales;
    }

    if (salesPeriod === "monthly") {
      return monthlySales;
    }

    return previousMonthlySales;
  }, [
    salesPeriod,
    todaySales,
    weeklySales,
    monthlySales,
    previousMonthlySales,
  ]);

  const selectedSalesAmount = useMemo(() => {
    return selectedSales.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0,
    );
  }, [selectedSales]);

  // ==========================================
  // LABELS
  // ==========================================

  const getSalesPeriodLabel = () => {
    if (salesPeriod === "today") {
      return "Today";
    }

    if (salesPeriod === "weekly") {
      return "This Week";
    }

    if (salesPeriod === "monthly") {
      return "This Month";
    }

    return "Previous Month";
  };

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

  const getOrderTypeLabel = (
    orderType?: "WAITER" | "QR",
  ) => {
    return orderType === "QR"
      ? "QR Order"
      : "Waiter Order";
  };

  // ==========================================
  // RECEIVE CASH PAYMENT
  // ==========================================

  const receivePayment = async () => {
    if (!selectedPayment) {
      return;
    }

    if (
      normalizeStatus(
        selectedPayment.status,
      ) !== "PENDING"
    ) {
      alert(
        "This payment is no longer pending.",
      );

      setSelectedPayment(null);
      await fetchPayments();

      return;
    }

    if (selectedPayment.method !== "CASH") {
      alert(
        "Only cash payments can be completed manually.",
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
      setInvoicePayment(updatedPayment);
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
  // PRINT
  // ==========================================

  const printInvoice = () => {
    window.print();
  };

  const printSalesReport = () => {
    const reportRows =
      selectedSales
        .map(
          (payment) => `
            <tr>
              <td>${
                payment.order?.orderNumber ||
                `#${payment.orderId}`
              }</td>
              <td>${new Date(
                payment.createdAt,
              ).toLocaleDateString("en-BD")}</td>
              <td>${getPaymentMethodLabel(
                payment.method,
              )}</td>
              <td>BDT ${Number(
                payment.amount,
              ).toFixed(2)}</td>
            </tr>
          `,
        )
        .join("");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700",
      );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${getSalesPeriodLabel()} Sales Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }

            h1 {
              text-align: center;
              margin-bottom: 5px;
            }

            h2 {
              text-align: center;
              font-weight: normal;
              margin-top: 0;
            }

            .summary {
              margin: 25px 0;
              padding: 15px;
              background: #f5f5f5;
              display: flex;
              justify-content: space-between;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border-bottom: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
            }

            .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
            }
          </style>
        </head>

        <body>

          <h1>Restaurant POS</h1>

          <h2>${getSalesPeriodLabel()} Sales Report</h2>

          <div class="summary">
            <strong>
              Paid Transactions:
              ${selectedSales.length}
            </strong>

            <strong>
              Total Sales:
              BDT ${selectedSalesAmount.toFixed(2)}
            </strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              ${reportRows}
            </tbody>
          </table>

          <div class="total">
            Total Sales:
            BDT ${selectedSalesAmount.toFixed(2)}
          </div>

        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // ==========================================
  // DOWNLOAD INVOICE PDF
  // ==========================================

  const downloadInvoicePDF = (
    payment: Payment,
  ) => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    let y = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Restaurant POS",
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Payment Invoice",
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    y += 12;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 8;

    doc.text(
      `Invoice: INV-${payment.id}`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Order: ${
        payment.order?.orderNumber ||
        payment.orderId
      }`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Customer: ${
        payment.order?.customerName ||
        "Walk-in Customer"
      }`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Table: ${
        payment.order?.table?.tableNumber ??
        "-"
      }`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Order Type: ${getOrderTypeLabel(
        payment.order?.orderType,
      )}`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Date: ${formatDate(
        payment.createdAt,
      )}`,
      15,
      y,
    );

    y += 10;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 8;

    doc.setFont("helvetica", "bold");

    doc.text("Items", 15, y);

    doc.text(
      "Amount",
      pageWidth - 15,
      y,
      {
        align: "right",
      },
    );

    y += 7;

    doc.setFont("helvetica", "normal");

    payment.order?.orderItems?.forEach(
      (item) => {
        const itemName =
          item.menuItem?.name ||
          "Menu Item";

        const quantity =
          Number(item.quantity || 0);

        const subtotal =
          Number(item.subtotal || 0);

        doc.text(
          `${itemName} x ${quantity}`,
          15,
          y,
        );

        doc.text(
          `BDT ${subtotal.toFixed(2)}`,
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 7;

        if (y > 265) {
          doc.addPage();
          y = 20;
        }
      },
    );

    y += 3;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 9;

    doc.setFont("helvetica", "bold");

    doc.text("Total", 15, y);

    doc.text(
      `BDT ${Number(
        payment.amount,
      ).toFixed(2)}`,
      pageWidth - 15,
      y,
      {
        align: "right",
      },
    );

    y += 8;

    doc.setFont("helvetica", "normal");

    doc.text(
      `Payment Method: ${getPaymentMethodLabel(
        payment.method,
      )}`,
      15,
      y,
    );

    y += 6;

    doc.text(
      "Status: PAID",
      15,
      y,
    );

    if (payment.transactionId) {
      y += 6;

      doc.text(
        `Transaction ID: ${payment.transactionId}`,
        15,
        y,
      );
    }

    y += 15;

    doc.text(
      "Thank you for dining with us!",
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    doc.save(
      `invoice-${payment.id}.pdf`,
    );
  };

  // ==========================================
  // DOWNLOAD SALES REPORT PDF
  // ==========================================

  const downloadSalesReportPDF = () => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    let y = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Restaurant POS",
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    y += 9;

    doc.setFontSize(14);

    doc.text(
      `${getSalesPeriodLabel()} Sales Report`,
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Generated: ${new Date().toLocaleString(
        "en-BD",
      )}`,
      15,
      y,
    );

    y += 8;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 10;

    doc.setFont("helvetica", "bold");

    doc.text(
      `Paid Transactions: ${selectedSales.length}`,
      15,
      y,
    );

    y += 7;

    doc.text(
      `Total Sales: BDT ${selectedSalesAmount.toFixed(
        2,
      )}`,
      15,
      y,
    );

    y += 12;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 9;

    doc.setFont("helvetica", "bold");

    doc.text("Order", 15, y);
    doc.text("Date", 60, y);
    doc.text("Method", 105, y);

    doc.text(
      "Amount",
      pageWidth - 15,
      y,
      {
        align: "right",
      },
    );

    y += 7;

    doc.setFont("helvetica", "normal");

    selectedSales.forEach((payment) => {
      if (y > 270) {
        doc.addPage();
        y = 20;

        doc.setFont("helvetica", "bold");

        doc.text("Order", 15, y);
        doc.text("Date", 60, y);
        doc.text("Method", 105, y);

        doc.text(
          "Amount",
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 7;

        doc.setFont("helvetica", "normal");
      }

      doc.text(
        payment.order?.orderNumber ||
          `#${payment.orderId}`,
        15,
        y,
      );

      doc.text(
        new Date(
          payment.createdAt,
        ).toLocaleDateString("en-BD"),
        60,
        y,
      );

      doc.text(
        getPaymentMethodLabel(
          payment.method,
        ),
        105,
        y,
      );

      doc.text(
        `BDT ${Number(
          payment.amount,
        ).toFixed(2)}`,
        pageWidth - 15,
        y,
        {
          align: "right",
        },
      );

      y += 7;
    });

    y += 5;

    doc.line(
      15,
      y,
      pageWidth - 15,
      y,
    );

    y += 10;

    doc.setFont("helvetica", "bold");

    doc.text(
      `Total Sales: BDT ${selectedSalesAmount.toFixed(
        2,
      )}`,
      pageWidth - 15,
      y,
      {
        align: "right",
      },
    );

    doc.save(
      `${salesPeriod}-sales-report.pdf`,
    );
  };

  // ==========================================
  // UI
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            Loading cashier...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-5 sm:px-7 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <Banknote className="w-5 h-5" />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Cashier
                  </h1>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Payments & sales
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                fetchPayments(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing"
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="p-5 sm:p-7 max-w-[1600px] mx-auto">
        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                  Today
                </p>

                <p className="text-2xl font-bold mt-2 tracking-tight">
                  {formatMoney(
                    todaySalesAmount,
                  )}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {todaySales.length} paid
                  transactions
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Pending
                </p>

                <p className="text-2xl font-bold mt-2 tracking-tight">
                  {pendingPayments.length}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {formatMoney(
                    pendingAmount,
                  )}{" "}
                  awaiting payment
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Paid
                </p>

                <p className="text-2xl font-bold mt-2 tracking-tight">
                  {paidPayments.length}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Successful payment records
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* SALES REPORT */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sales Report
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {getSalesPeriodLabel()} ·{" "}
                {selectedSales.length}{" "}
                transactions ·{" "}
                {formatMoney(
                  selectedSalesAmount,
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={salesPeriod}
                  onChange={(e) =>
                    setSalesPeriod(
                      e.target
                        .value as SalesPeriod,
                    )
                  }
                  className="appearance-none h-9 min-w-[150px] pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
                >
                  <option value="today">
                    Today
                  </option>

                  <option value="weekly">
                    This Week
                  </option>

                  <option value="monthly">
                    This Month
                  </option>

                  <option value="previousMonthly">
                    Previous Month
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>

              <button
                onClick={
                  printSalesReport
                }
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>

              <button
                onClick={
                  downloadSalesReportPDF
                }
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>
        </section>

        {/* PAYMENTS */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() =>
                    setActiveTab(
                      "pending",
                    )
                  }
                  className={`h-9 px-4 rounded-lg text-xs font-semibold transition ${
                    activeTab ===
                    "pending"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pending

                  <span
                    className={`ml-2 ${
                      activeTab ===
                      "pending"
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {pendingPayments.length}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setActiveTab(
                      "history",
                    )
                  }
                  className={`h-9 px-4 rounded-lg text-xs font-semibold transition ${
                    activeTab ===
                    "history"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  History

                  <span
                    className={`ml-2 ${
                      activeTab ===
                      "history"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {paidPayments.length}
                  </span>
                </button>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value,
                    )
                  }
                  placeholder="Search order, table or customer..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {displayedPayments.length ===
            0 ? (
              <div className="py-16 text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-slate-400" />
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {activeTab ===
                  "pending"
                    ? "No pending payments"
                    : "No payment history"}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {activeTab ===
                  "pending"
                    ? "New payment requests will appear here."
                    : "Paid transactions will appear here."}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Table
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayedPayments.map(
                    (payment) => {
                      const status =
                        normalizeStatus(
                          payment.status,
                        );

                      return (
                        <tr
                          key={
                            payment.id
                          }
                          className="hover:bg-slate-50/80 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-sm text-slate-900">
                              {payment
                                .order
                                ?.orderNumber ||
                                `#${payment.orderId}`}
                            </div>

                            <div className="text-xs text-slate-400 mt-1">
                              {payment
                                .order
                                ?.customerName ||
                                "Walk-in Customer"}{" "}
                              ·{" "}
                              {formatDate(
                                payment.createdAt,
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                              T-
                              {String(
                                payment
                                  .order
                                  ?.table
                                  ?.tableNumber ??
                                  "-",
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-bold text-sm text-slate-900">
                              {formatMoney(
                                payment.amount,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                {getPaymentIcon(
                                  payment.method,
                                )}
                              </span>

                              {getPaymentMethodLabel(
                                payment.method,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {status ===
                            "PAID" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                PAID
                              </span>
                            ) : status ===
                              "PENDING" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                                <Clock3 className="w-3.5 h-3.5" />
                                PENDING
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500">
                                {status}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {status ===
                            "PENDING" ? (
                              payment.method ===
                              "CASH" ? (
                                <button
                                  onClick={() =>
                                    setSelectedPayment(
                                      payment,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                                >
                                  <Banknote className="w-3.5 h-3.5" />
                                  Receive
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">
                                  Awaiting
                                  online
                                  payment
                                </span>
                              )
                            ) : status ===
                              "PAID" ? (
                              <button
                                onClick={() =>
                                  setInvoicePayment(
                                    payment,
                                  )
                                }
                                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Invoice
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* RECEIVE PAYMENT MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Cash payment
                </p>

                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Confirm payment
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedPayment(
                    null,
                  )
                }
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      Order
                    </p>

                    <p className="font-bold text-slate-900 mt-1">
                      {
                        selectedPayment
                          .order
                          ?.orderNumber
                      }
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold">
                    T-
                    {String(
                      selectedPayment
                        .order
                        ?.table
                        ?.tableNumber ??
                        "-",
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200 my-4" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      Customer
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {selectedPayment
                        .order
                        ?.customerName ||
                        "Walk-in Customer"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Amount due
                    </p>

                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {formatMoney(
                        selectedPayment.amount,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Cash
                  </p>

                  <p className="text-xs text-slate-500">
                    Mark this payment as
                    received
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setSelectedPayment(
                      null,
                    )
                  }
                  disabled={processing}
                  className="h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    receivePayment
                  }
                  disabled={processing}
                  className="h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
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

      {/* INVOICE MODAL */}
      {invoicePayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Payment complete
                </p>

                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Invoice
                </h2>
              </div>

              <button
                onClick={() =>
                  setInvoicePayment(
                    null,
                  )
                }
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div
              id="invoice"
              className="p-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Restaurant POS
                  </h1>

                  <p className="text-xs text-slate-500 mt-1">
                    Payment Invoice
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PAID
                </span>
              </div>

              <div className="py-4 border-b border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-slate-500">
                    Invoice
                  </span>

                  <span className="text-right font-medium">
                    INV-
                    {
                      invoicePayment.id
                    }
                  </span>

                  <span className="text-slate-500">
                    Order
                  </span>

                  <span className="text-right font-medium">
                    {
                      invoicePayment
                        .order
                        ?.orderNumber
                    }
                  </span>

                  <span className="text-slate-500">
                    Table
                  </span>

                  <span className="text-right font-medium">
                    T-
                    {String(
                      invoicePayment
                        .order
                        ?.table
                        ?.tableNumber ??
                        "-",
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span className="text-slate-500">
                    Customer
                  </span>

                  <span className="text-right font-medium">
                    {invoicePayment
                      .order
                      ?.customerName ||
                      "Walk-in Customer"}
                  </span>

                  <span className="text-slate-500">
                    Date
                  </span>

                  <span className="text-right font-medium">
                    {formatDate(
                      invoicePayment.createdAt,
                    )}
                  </span>
                </div>
              </div>

              <div className="py-4 space-y-3 border-b border-slate-200">
                {invoicePayment.order?.orderItems?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {
                            item
                              .menuItem
                              ?.name
                          }
                        </p>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {
                            item.quantity
                          }{" "}
                          ×{" "}
                          {formatMoney(
                            item.unitPrice,
                          )}
                        </p>
                      </div>

                      <span className="font-semibold text-slate-800 shrink-0">
                        {formatMoney(
                          item.subtotal,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Payment method
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {getPaymentMethodLabel(
                      invoicePayment.method,
                    )}
                  </span>
                </div>

                {invoicePayment.transactionId && (
                  <div className="flex items-start justify-between gap-4 mt-2 text-xs">
                    <span className="text-slate-500">
                      Transaction ID
                    </span>

                    <span className="font-medium text-slate-700 text-right break-all">
                      {
                        invoicePayment.transactionId
                      }
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <span className="font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    {formatMoney(
                      invoicePayment.amount,
                    )}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-6">
                Thank you for dining with
                us.
              </p>
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={
                    printInvoice
                  }
                  className="inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                <button
                  onClick={() =>
                    downloadInvoicePDF(
                      invoicePayment,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT CSS */}
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
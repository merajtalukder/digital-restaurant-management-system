import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  ChefHat,
  Utensils,
  XCircle,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Receipt,
} from "lucide-react";

import api from "../../api/axios";

interface Payment {
  id: number;
  method: string;
  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";
  amount: number | string;
  transactionId?: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;

  status:
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "COMPLETED"
    | "CANCELLED";

  totalAmount: number | string;

  table?: {
    tableNumber: number;
  };

  payment?: Payment | null;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // FETCH ORDER
  // =========================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/orders/${orderId}`
        );

        console.log(
          "Order Tracking:",
          response.data
        );

        setOrder(response.data);
      } catch (err: any) {
        console.error(
          "Failed to load order:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load order information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading order status...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !order) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-3">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-800">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Unable to find this order."}
          </p>

          <Link
            to="/customer/orders"
            className="
              mt-5 flex items-center justify-center gap-2
              rounded-2xl
              bg-gradient-to-r
              from-emerald-500
              via-teal-500
              to-cyan-500
              py-3
              text-sm font-semibold
              text-white
              shadow-md
              transition
              hover:shadow-lg
            "
          >
            View My Orders
          </Link>

        </div>
      </div>
    );
  }

  // =========================
  // STATUS STEPS
  // =========================

  const steps = [
    {
      key: "PENDING",
      title: "Order Placed",
      description:
        "Your order has been placed.",
      icon: Receipt,
    },
    {
      key: "PREPARING",
      title: "Preparing Food",
      description:
        "Your food is being prepared.",
      icon: ChefHat,
    },
    {
      key: "READY",
      title: "Ready To Serve",
      description:
        "Your order is ready.",
      icon: Utensils,
    },
    {
      key: "SERVED",
      title: "Served",
      description:
        "Your order has been served.",
      icon: CheckCircle2,
    },
  ];

  // =========================
  // CURRENT STATUS INDEX
  // =========================

  const statusIndex = steps.findIndex(
    (step) => step.key === order.status
  );

  const isCompleted =
    order.status === "COMPLETED";

  const isCancelled =
    order.status === "CANCELLED";

  // =========================
  // PAYMENT STATUS
  // =========================

  const payment = order.payment;

  const paymentPending =
    payment?.status === "PENDING";

  const paymentPaid =
    payment?.status === "PAID";

  // =========================
  // PAY NOW
  // =========================

  const handlePayNow = () => {
    navigate(
      `/customer/payment/${order.id}`
    );
  };

  return (
    <div className="min-h-full bg-slate-50 px-3 pb-24 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-2xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-4 flex items-center gap-3">

          <Link
            to="/customer/orders"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl
              bg-white
              text-slate-600
              shadow-sm
              transition
              hover:bg-emerald-50
              hover:text-emerald-600
            "
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800">
              Track Your Order
            </h1>

            <p className="truncate text-xs text-slate-500">
              Order #{order.orderNumber}
            </p>
          </div>

        </div>

        {/* =========================
            CANCELLED
        ========================= */}

        {isCancelled && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                <XCircle size={21} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-red-600">
                  Order Cancelled
                </h2>

                <p className="mt-0.5 text-xs text-red-500">
                  Unfortunately, this order has been cancelled.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* =========================
            ORDER INFO
        ========================= */}

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-[11px] text-slate-400">
                Order Number
              </p>

              <p className="mt-0.5 text-base font-bold text-slate-800">
                #{order.orderNumber}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400">
                Total
              </p>

              <p className="mt-0.5 text-lg font-bold text-emerald-600">
                ৳
                {Number(
                  order.totalAmount
                ).toFixed(2)}
              </p>
            </div>

          </div>

          {/* TABLE */}

          {order.table && (
            <div className="mt-3 border-t border-slate-100 pt-3">

              <p className="text-[11px] text-slate-400">
                Table
              </p>

              <p className="mt-0.5 text-sm font-bold text-slate-700">
                T-
                {String(
                  order.table.tableNumber
                ).padStart(2, "0")}
              </p>

            </div>
          )}

        </div>

        {/* =========================
            PAYMENT SECTION
        ========================= */}

        {payment && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                  <CreditCard size={18} />
                </div>

                <div>
                  <p className="text-[11px] text-slate-400">
                    Payment
                  </p>

                  <h2 className="text-base font-bold text-slate-800">
                    ৳
                    {Number(
                      payment.amount
                    ).toFixed(2)}
                  </h2>
                </div>

              </div>

              {/* PAYMENT STATUS */}

              {paymentPaid ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 size={13} />
                  PAID
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600">
                  <Clock3 size={13} />
                  PENDING
                </span>
              )}

            </div>

            {/* PAYMENT METHOD */}

            <div className="mt-3 border-t border-slate-100 pt-3">

              <p className="text-[11px] text-slate-400">
                Payment Method
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {payment.method === "CASH"
                  ? "Cash"
                  : payment.method === "BKASH"
                  ? "bKash"
                  : payment.method === "NAGAD"
                  ? "Nagad"
                  : payment.method === "CARD"
                  ? "Card"
                  : payment.method}
              </p>

            </div>

            {/* PAY NOW */}

            {paymentPending &&
              !isCancelled && (
                <div className="mt-4">

                  <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 p-3">

                    <div className="flex items-start gap-2">

                      <Clock3
                        size={16}
                        className="mt-0.5 shrink-0 text-amber-500"
                      />

                      <div>
                        <p className="text-xs font-bold text-amber-700">
                          Payment is still pending
                        </p>

                        <p className="mt-0.5 text-[11px] text-amber-600">
                          Complete your payment to finish the order.
                        </p>
                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handlePayNow}
                    className="
                      flex w-full items-center
                      justify-center gap-2
                      rounded-2xl
                      bg-gradient-to-r
                      from-violet-500
                      to-fuchsia-500
                      py-3
                      text-sm font-bold
                      text-white
                      shadow-md
                      transition
                      hover:shadow-lg
                    "
                  >
                    <CreditCard size={17} />
                    Pay Now
                  </button>

                </div>
              )}

          </div>
        )}

        {/* =========================
            ORDER STATUS
        ========================= */}

        {!isCancelled && (
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-5 flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <Clock3 size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Order Status
                </h2>

                <p className="text-[11px] text-slate-400">
                  Follow your order progress
                </p>
              </div>

            </div>

            <div className="space-y-1">

              {steps.map(
                (step, index) => {
                  const completed =
                    isCompleted ||
                    index < statusIndex;

                  const active =
                    !isCompleted &&
                    index === statusIndex;

                  const pending =
                    !completed &&
                    !active;

                  const Icon =
                    step.icon;

                  return (
                    <div
                      key={step.key}
                      className="relative flex gap-3"
                    >

                      {/* CONNECTOR */}

                      {index <
                        steps.length - 1 && (
                        <div
                          className={`
                            absolute
                            left-[18px]
                            top-10
                            h-[calc(100%-4px)]
                            w-0.5
                            ${
                              completed
                                ? "bg-emerald-400"
                                : "bg-slate-200"
                            }
                          `}
                        />
                      )}

                      {/* CIRCLE */}

                      <div
                        className={`
                          relative z-10
                          flex h-9 w-9
                          shrink-0
                          items-center justify-center
                          rounded-xl
                          transition
                          ${
                            completed
                              ? "bg-emerald-500 text-white shadow-sm"
                              : active
                              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-400"
                          }
                        `}
                      >
                        {completed ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Icon size={17} />
                        )}
                      </div>

                      {/* TEXT */}

                      <div className="pb-5 pt-0.5">

                        <h3
                          className={`
                            text-sm font-bold
                            ${
                              pending
                                ? "text-slate-400"
                                : "text-slate-800"
                            }
                          `}
                        >
                          {step.title}
                        </h3>

                        {!pending && (
                          <p
                            className={`
                              mt-0.5 text-xs
                              ${
                                active
                                  ? "font-medium text-violet-500"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {active
                              ? step.description
                              : completed
                              ? "Completed"
                              : ""}
                          </p>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* COMPLETED MESSAGE */}

            {isCompleted && (
              <div className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 py-3 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={16} />
                Your order has been completed.
              </div>
            )}

          </div>
        )}

        {/* =========================
            BACK TO ORDERS
        ========================= */}

        <Link
          to="/customer/orders"
          className="
            mt-4 flex items-center
            justify-center gap-2
            rounded-2xl
            bg-gradient-to-r
            from-emerald-500
            via-teal-500
            to-cyan-500
            py-3
            text-sm font-semibold
            text-white
            shadow-md
            transition
            hover:shadow-lg
          "
        >
          View My Orders
        </Link>

      </div>
    </div>
  );
};

export default OrderTracking;
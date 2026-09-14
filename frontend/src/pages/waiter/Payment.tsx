import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../../api/axios";

type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "CASH";

interface Payment {
  id: number;
  method: string;
  status: string;
  amount: number | string;
  transactionId?: string | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  menuItem?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number | string;
  tableId?: number;
  table?: {
    tableNumber?: number | string;
  };
  status?: string;
  payment?: Payment | null;
  orderItems?: OrderItem[];
}

const Payment = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);

  const [method, setMethod] =
    useState<PaymentMethod>("CASH");

  const [transactionId, setTransactionId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD ORDER
  // =========================
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!orderId) {
          setError("Order ID was not found.");
          return;
        }

        const numericOrderId = Number(orderId);

        if (
          !Number.isInteger(numericOrderId) ||
          numericOrderId <= 0
        ) {
          setError("Invalid Order ID.");
          return;
        }

        const response =
          await api.get(
            `/orders/${numericOrderId}`,
          );

        const fetchedOrder: Order =
          response.data;

        if (!fetchedOrder) {
          setError("Order not found.");
          return;
        }

        setOrder(fetchedOrder);

        // Already PAID
        // Waiter does not see success page.
        if (
          fetchedOrder.payment?.status ===
          "PAID"
        ) {
          navigate(
            "/waiter/orders",
            {
              replace: true,
            },
          );
        }
      } catch (err: any) {
        console.error(
          "Payment order fetch error:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load order.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  // =========================
  // CREATE PAYMENT
  // =========================
  const handleSubmitPayment =
    async () => {
      try {
        setError("");

        if (!order) {
          setError(
            "Order not found.",
          );
          return;
        }

        if (
          order.payment?.status ===
          "PAID"
        ) {
          navigate(
            "/waiter/orders",
            {
              replace: true,
            },
          );
          return;
        }

        // bKash / Nagad transaction ID
        if (
          (method === "BKASH" ||
            method === "NAGAD") &&
          !transactionId.trim()
        ) {
          setError(
            `Please enter ${method} transaction ID.`,
          );
          return;
        }

        // Card transaction ID
        if (
          method === "CARD" &&
          !transactionId.trim()
        ) {
          setError(
            "Please enter card transaction ID.",
          );
          return;
        }

        setSubmitting(true);

        // =====================================
        // IMPORTANT
        // Payment is created ONLY when Pay is clicked.
        // Status will always be PENDING.
        // Cashier will later confirm it.
        // =====================================
        await api.post(
          "/payments",
          {
            orderId: order.id,
            amount: Number(
              order.totalAmount || 0,
            ),
            method,
            transactionId:
              transactionId.trim() ||
              undefined,
          },
        );

        // Waiter does NOT see payment success.
        // Simply go back to orders.
        navigate(
          "/waiter/orders",
          {
            replace: true,
            state: {
              paymentSubmitted: true,
              orderId: order.id,
            },
          },
        );
      } catch (err: any) {
        console.error(
          "Payment creation error:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            "Failed to submit payment.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

          <p className="text-gray-600">
            Loading payment...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto pt-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Payment Error
            </h2>

            <p className="text-red-500 mb-6">
              {error}
            </p>

            <button
              onClick={() =>
                navigate(
                  "/waiter/orders",
                )
              }
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const totalAmount =
    Number(
      order.totalAmount || 0,
    );

  const isPending =
    order.payment?.status ===
    "PENDING";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* =========================
          HEADER
      ========================= */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Payment
            </h1>

            <p className="text-sm text-gray-500">
              Order #
              {order.orderNumber ||
                order.id}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* =========================
            ORDER SUMMARY
        ========================= */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">

          <div className="flex justify-between items-start mb-4">

            <div>
              <h2 className="font-bold text-gray-900">
                Order Summary
              </h2>

              {order.table
                ?.tableNumber && (
                <p className="text-sm text-gray-500 mt-1">
                  Table{" "}
                  {
                    order.table
                      .tableNumber
                  }
                </p>
              )}
            </div>

            {order.payment
              ?.status && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.payment
                    .status ===
                  "PAID"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {
                  order.payment
                    .status
                }
              </span>
            )}
          </div>

          <div className="space-y-3">

            {order.orderItems?.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {item.menuItem
                        ?.name ||
                        "Menu Item"}
                    </span>

                    <span className="text-gray-500 ml-2">
                      ×{" "}
                      {
                        item.quantity
                      }
                    </span>
                  </div>

                  <span className="font-medium">
                    ৳
                    {Number(
                      item.subtotal,
                    ).toFixed(2)}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between">

            <span className="font-bold text-gray-900">
              Total
            </span>

            <span className="text-xl font-bold text-orange-600">
              ৳
              {totalAmount.toFixed(
                2,
              )}
            </span>
          </div>
        </div>

        {/* =========================
            EXISTING PENDING PAYMENT
        ========================= */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5">

            <div className="flex gap-3">

              <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5" />

              <div>
                <p className="font-semibold text-yellow-800">
                  Payment is pending
                </p>

                <p className="text-sm text-yellow-700 mt-1">
                  This payment has already
                  been sent to the Cashier
                  for confirmation.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">

            <div className="flex gap-2">

              <AlertCircle className="w-5 h-5 text-red-500" />

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>
          </div>
        )}

        {/* =========================
            PAYMENT METHOD
        ========================= */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">

          <h2 className="font-bold text-gray-900 mb-4">
            Select Payment Method
          </h2>

          <div className="grid grid-cols-2 gap-3">

            {/* CASH */}
            <button
              type="button"
              onClick={() => {
                setMethod("CASH");
                setTransactionId("");
                setError("");
              }}
              className={`p-4 rounded-xl border-2 transition ${
                method === "CASH"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Banknote
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "CASH"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              />

              <p className="font-semibold text-sm">
                Cash
              </p>
            </button>

            {/* CARD */}
            <button
              type="button"
              onClick={() => {
                setMethod("CARD");
                setTransactionId("");
                setError("");
              }}
              className={`p-4 rounded-xl border-2 transition ${
                method === "CARD"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <CreditCard
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "CARD"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              />

              <p className="font-semibold text-sm">
                Card
              </p>
            </button>

            {/* BKASH */}
            <button
              type="button"
              onClick={() => {
                setMethod("BKASH");
                setTransactionId("");
                setError("");
              }}
              className={`p-4 rounded-xl border-2 transition ${
                method === "BKASH"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Smartphone
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "BKASH"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              />

              <p className="font-semibold text-sm">
                bKash
              </p>
            </button>

            {/* NAGAD */}
            <button
              type="button"
              onClick={() => {
                setMethod("NAGAD");
                setTransactionId("");
                setError("");
              }}
              className={`p-4 rounded-xl border-2 transition ${
                method === "NAGAD"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Smartphone
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "NAGAD"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              />

              <p className="font-semibold text-sm">
                Nagad
              </p>
            </button>

          </div>
        </div>

        {/* =========================
            TRANSACTION ID
        ========================= */}
        {method !== "CASH" && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">

            <label className="block font-semibold text-gray-800 mb-2">
              {method ===
              "BKASH"
                ? "bKash Transaction ID"
                : method ===
                    "NAGAD"
                  ? "Nagad Transaction ID"
                  : "Card Transaction ID"}
            </label>

            <input
              type="text"
              value={
                transactionId
              }
              onChange={(e) =>
                setTransactionId(
                  e.target.value,
                )
              }
              placeholder="Enter transaction ID"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />

          </div>
        )}

        {/* =========================
            CASH INFORMATION
        ========================= */}
        {method === "CASH" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">

            <p className="font-semibold text-blue-800">
              Cash Payment
            </p>

            <p className="text-sm text-blue-700 mt-1">
              Send this payment request
              to the Cashier. The Cashier
              will verify and confirm the
              payment.
            </p>

          </div>
        )}

        {/* =========================
            SUBMIT BUTTON
        ========================= */}
        <button
          type="button"
          onClick={
            handleSubmitPayment
          }
          disabled={
            submitting ||
            isPending ||
            order.payment
              ?.status === "PAID"
          }
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : isPending ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Payment Pending
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Pay ৳
              {totalAmount.toFixed(
                2,
              )}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          Payment will be confirmed by
          Cashier.
        </p>

      </div>
    </div>
  );
};

export default Payment;
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
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import api from "../../api/axios";

type PaymentMethod =
  | "BKASH"
  | "NAGAD"
  | "ROCKET"
  | "CARD"
  | "CASH";

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

interface InitiatePaymentResponse {
  success: boolean;
  paymentId: number;
  orderId: number;
  transactionId: string;
  gatewayPageURL: string;
  sessionKey?: string | null;
}

const Payment = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);

  const [method, setMethod] =
    useState<PaymentMethod>("CASH");

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

        const response = await api.get<Order>(
          `/orders/${numericOrderId}`,
        );

        const fetchedOrder = response.data;

        if (!fetchedOrder) {
          setError("Order not found.");
          return;
        }

        setOrder(fetchedOrder);

        if (
          fetchedOrder.payment?.status ===
          "PAID"
        ) {
          navigate("/waiter/orders", {
            replace: true,
          });
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
  // CREATE CASH PAYMENT
  // =========================

  const createCashPayment = async () => {
    if (!order) {
      setError("Order not found.");
      return;
    }

    const response = await api.post<Payment>(
      "/payments",
      {
        orderId: order.id,
        amount: Number(
          order.totalAmount || 0,
        ),
        method: "CASH",
      },
    );

    if (!response.data) {
      throw new Error(
        "Payment could not be created.",
      );
    }

    navigate("/waiter/orders", {
      replace: true,
      state: {
        paymentSubmitted: true,
        paymentMethod: "CASH",
        orderId: order.id,
      },
    });
  };

  // =========================
  // CREATE ONLINE PAYMENT
  // =========================

  const createOnlinePayment = async () => {
    if (!order) {
      setError("Order not found.");
      return;
    }

    const createResponse =
      await api.post<Payment>(
        "/payments",
        {
          orderId: order.id,
          amount: Number(
            order.totalAmount || 0,
          ),
          method,
        },
      );

    const payment = createResponse.data;

    if (!payment?.id) {
      throw new Error(
        "Payment could not be created.",
      );
    }

    const initiateResponse =
      await api.post<InitiatePaymentResponse>(
        `/payments/${payment.id}/initiate`,
      );

    const data = initiateResponse.data;

    if (
      !data?.success ||
      !data?.gatewayPageURL
    ) {
      throw new Error(
        "Payment gateway URL was not received.",
      );
    }

    window.location.href =
      data.gatewayPageURL;
  };

  // =========================
  // SUBMIT PAYMENT
  // =========================

  const handleSubmitPayment =
    async () => {
      try {
        setError("");

        if (!order) {
          setError("Order not found.");
          return;
        }

        if (
          order.payment?.status ===
          "PAID"
        ) {
          navigate("/waiter/orders", {
            replace: true,
          });

          return;
        }

        setSubmitting(true);

        if (method === "CASH") {
          await createCashPayment();
        } else {
          await createOnlinePayment();
        }
      } catch (err: any) {
        console.error(
          "Payment submission error:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to process payment.",
        );

        setSubmitting(false);
      }
    };

  // =========================
  // PAYMENT METHOD ICON
  // =========================

  const getMethodIcon = (
    paymentMethod: PaymentMethod,
    selected: boolean,
  ) => {
    const className = `w-7 h-7 mx-auto mb-2 ${
      selected
        ? "text-orange-500"
        : "text-gray-500"
    }`;

    if (paymentMethod === "CASH") {
      return (
        <Banknote
          className={className}
        />
      );
    }

    if (paymentMethod === "CARD") {
      return (
        <CreditCard
          className={className}
        />
      );
    }

    return (
      <Smartphone
        className={className}
      />
    );
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

  const totalAmount = Number(
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
            disabled={submitting}
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
                  This payment is already waiting for confirmation.
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
                setError("");
              }}
              disabled={
                submitting ||
                isPending
              }
              className={`p-4 rounded-xl border-2 transition ${
                method === "CASH"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              } disabled:opacity-50`}
            >
              {getMethodIcon(
                "CASH",
                method === "CASH",
              )}

              <p className="font-semibold text-sm">
                Cash
              </p>
            </button>

            {/* CARD */}

            <button
              type="button"
              onClick={() => {
                setMethod("CARD");
                setError("");
              }}
              disabled={
                submitting ||
                isPending
              }
              className={`p-4 rounded-xl border-2 transition ${
                method === "CARD"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              } disabled:opacity-50`}
            >
              {getMethodIcon(
                "CARD",
                method === "CARD",
              )}

              <p className="font-semibold text-sm">
                Card
              </p>
            </button>

            {/* BKASH */}

            <button
              type="button"
              onClick={() => {
                setMethod("BKASH");
                setError("");
              }}
              disabled={
                submitting ||
                isPending
              }
              className={`p-4 rounded-xl border-2 transition ${
                method === "BKASH"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              } disabled:opacity-50`}
            >
              {getMethodIcon(
                "BKASH",
                method === "BKASH",
              )}

              <p className="font-semibold text-sm">
                bKash
              </p>
            </button>

            {/* NAGAD */}

            <button
              type="button"
              onClick={() => {
                setMethod("NAGAD");
                setError("");
              }}
              disabled={
                submitting ||
                isPending
              }
              className={`p-4 rounded-xl border-2 transition ${
                method === "NAGAD"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              } disabled:opacity-50`}
            >
              {getMethodIcon(
                "NAGAD",
                method === "NAGAD",
              )}

              <p className="font-semibold text-sm">
                Nagad
              </p>
            </button>

            {/* ROCKET */}

            <button
              type="button"
              onClick={() => {
                setMethod("ROCKET");
                setError("");
              }}
              disabled={
                submitting ||
                isPending
              }
              className={`p-4 rounded-xl border-2 transition ${
                method === "ROCKET"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              } disabled:opacity-50`}
            >
              {getMethodIcon(
                "ROCKET",
                method === "ROCKET",
              )}

              <p className="font-semibold text-sm">
                Rocket
              </p>
            </button>

          </div>
        </div>

        {/* =========================
            ONLINE PAYMENT NOTICE
        ========================= */}

        {method !== "CASH" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">

            <div className="flex gap-3">

              <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />

              <div>
                <p className="font-semibold text-blue-800">
                  Online Payment
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  The customer will be redirected to the secure SSLCommerz payment page to complete the payment.
                </p>

                <p className="text-xs text-blue-600 mt-2">
                  No manual transaction ID is required.
                </p>
              </div>

            </div>

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
              Waiter receives the cash from the customer. The Cashier will verify and confirm the payment before marking it as PAID.
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
              <RefreshCw className="w-5 h-5 animate-spin" />

              {method === "CASH"
                ? "Sending..."
                : "Opening Payment Gateway..."}
            </>
          ) : isPending ? (
            <>
              <CheckCircle2 className="w-5 h-5" />

              Payment Pending
            </>
          ) : method === "CASH" ? (
            <>
              <Banknote className="w-5 h-5" />

              Send to Cashier
            </>
          ) : (
            <>
              <ExternalLink className="w-5 h-5" />

              Pay Online ৳
              {totalAmount.toFixed(
                2,
              )}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          {method === "CASH"
            ? "Cash payment will be confirmed by the Cashier."
            : "Online payment will be confirmed automatically after successful payment."}
        </p>

      </div>
    </div>
  );
};

export default Payment;
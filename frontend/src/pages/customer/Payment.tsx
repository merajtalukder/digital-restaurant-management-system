import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Smartphone,
  WalletCards,
} from "lucide-react";

import api from "../../api/axios";

// ==========================================
// TYPES
// ==========================================

type PaymentMethod =
  | "BKASH"
  | "NAGAD"
  | "ROCKET"
  | "CARD"
  | "CASH";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

interface PaymentData {
  id: number;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
}

interface OrderData {
  id: number;
  orderNumber?: string;
  totalAmount: number | string;
  customerName?: string | null;
  payment?: PaymentData | null;
}

// ==========================================
// PAYMENT OPTIONS
// ==========================================

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: "BKASH",
    title: "bKash",
    subtitle: "Pay securely with bKash",
    icon: Smartphone,
  },
  {
    id: "NAGAD",
    title: "Nagad",
    subtitle: "Pay securely with Nagad",
    icon: Smartphone,
  },
  {
    id: "ROCKET",
    title: "Rocket",
    subtitle: "Pay securely with Rocket",
    icon: WalletCards,
  },
  {
    id: "CARD",
    title: "Card",
    subtitle:
      "Visa, Mastercard and other cards",
    icon: CreditCard,
  },
  {
    id: "CASH",
    title: "Cash",
    subtitle:
      "Pay cash at the restaurant",
    icon: Banknote,
  },
];

const ONLINE_PAYMENT_METHODS: PaymentMethod[] = [
  "BKASH",
  "NAGAD",
  "ROCKET",
  "CARD",
];

// ==========================================
// PAYMENT PAGE
// ==========================================

const Payment = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [method, setMethod] =
    useState<PaymentMethod>("BKASH");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {
    if (!orderId) {
      alert("Order ID is missing.");
      navigate("/customer/menu");
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);

        const response =
          await api.get<OrderData>(
            `/orders/${orderId}`,
          );

        const orderData = response.data;

        setOrder(orderData);

        // ======================================
        // EXISTING PAYMENT
        // ======================================

        if (orderData.payment) {
          const existingPayment =
            orderData.payment;

          setMethod(
            existingPayment.method,
          );

          localStorage.setItem(
            "currentPaymentId",
            String(existingPayment.id),
          );

          localStorage.setItem(
            "currentPaymentStatus",
            existingPayment.status,
          );

          // ====================================
          // ALREADY PAID
          // ====================================

          if (
            existingPayment.status ===
            "PAID"
          ) {
            navigate(
              `/customer/order-tracking/${orderId}`,
              {
                replace: true,
                state: {
                  paymentSubmitted: true,
                  paymentMethod:
                    existingPayment.method,
                  paymentStatus: "PAID",
                },
              },
            );

            return;
          }
        }
      } catch (error) {
        console.error(
          "Failed to load order:",
          error,
        );

        alert(
          "Failed to load order.",
        );

        navigate(
          "/customer/menu",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  // ==========================================
  // SAVE PAYMENT INFORMATION
  // ==========================================

  const savePaymentInformation = (
    payment: PaymentData,
  ) => {
    localStorage.setItem(
      "currentPaymentId",
      String(payment.id),
    );

    localStorage.setItem(
      "currentPaymentStatus",
      String(payment.status),
    );
  };

  // ==========================================
  // GO TO ORDER TRACKING
  // ==========================================

  const goToOrderTracking = (
    payment: PaymentData,
  ) => {
    navigate(
      `/customer/order-tracking/${orderId}`,
      {
        state: {
          paymentSubmitted: true,
          paymentMethod: payment.method,
          paymentStatus: payment.status,
        },
      },
    );
  };

  // ==========================================
  // INITIATE ONLINE PAYMENT
  // ==========================================

  const initiateOnlinePayment = async (
    paymentId: number,
  ) => {
    const response =
      await api.post(
        `/payments/${paymentId}/initiate`,
      );

    const gatewayPageURL =
      response.data?.gatewayPageURL;

    if (!gatewayPageURL) {
      throw new Error(
        "SSLCOMMERZ gateway URL was not returned.",
      );
    }

    window.location.href =
      gatewayPageURL;
  };

  // ==========================================
  // CREATE / CONTINUE PAYMENT
  // ==========================================

  const createPayment = async () => {
    if (!order) {
      alert(
        "Order information is unavailable.",
      );
      return;
    }

    if (!orderId) {
      alert("Order ID is missing.");
      return;
    }

    try {
      setProcessing(true);

      // ======================================
      // VALIDATE ORDER AMOUNT
      // ======================================

      const orderAmount = Number(
        order.totalAmount,
      );

      if (
        !Number.isFinite(orderAmount) ||
        orderAmount <= 0
      ) {
        throw new Error(
          "Invalid order amount.",
        );
      }

      // ======================================
      // CHECK EXISTING PAYMENT
      // ======================================

      let payment = order.payment;

      if (payment) {
        // ====================================
        // ALREADY PAID
        // ====================================

        if (
          payment.status === "PAID"
        ) {
          savePaymentInformation(
            payment,
          );

          goToOrderTracking(
            payment,
          );

          return;
        }

        // ====================================
        // EXISTING PENDING PAYMENT
        // ====================================

        if (
          payment.status ===
          "PENDING"
        ) {
          savePaymentInformation(
            payment,
          );

          // -------------------------------
          // CASH
          // -------------------------------

          if (
            payment.method === "CASH"
          ) {
            goToOrderTracking(
              payment,
            );

            return;
          }

          // -------------------------------
          // ONLINE
          // -------------------------------

          if (
            ONLINE_PAYMENT_METHODS.includes(
              payment.method,
            )
          ) {
            await initiateOnlinePayment(
              payment.id,
            );

            return;
          }
        }

        // ====================================
        // FAILED PAYMENT
        // ====================================

        if (
          payment.status ===
          "FAILED"
        ) {
          throw new Error(
            "This payment has failed. Please contact the cashier or place a new order.",
          );
        }

        // ====================================
        // REFUNDED PAYMENT
        // ====================================

        if (
          payment.status ===
          "REFUNDED"
        ) {
          throw new Error(
            "This payment has been refunded and cannot be reused.",
          );
        }
      }

      // ======================================
      // CREATE NEW PAYMENT
      // ======================================

      const paymentResponse =
        await api.post<PaymentData>(
          "/payments",
          {
            orderId: Number(
              orderId,
            ),
            amount: orderAmount,
            method,
          },
        );

      payment =
        paymentResponse.data;

      if (!payment?.id) {
        throw new Error(
          "Payment creation failed.",
        );
      }

      savePaymentInformation(
        payment,
      );

      // ======================================
      // CASH PAYMENT
      // ======================================

      if (method === "CASH") {
        goToOrderTracking(
          payment,
        );

        return;
      }

      // ======================================
      // ONLINE PAYMENT
      // ======================================

      if (
        ONLINE_PAYMENT_METHODS.includes(
          method,
        )
      ) {
        await initiateOnlinePayment(
          payment.id,
        );

        return;
      }

      throw new Error(
        "Unsupported payment method.",
      );
    } catch (error: any) {
      console.error(
        "Payment error:",
        error,
      );

      const message =
        error?.response?.data
          ?.message ||
        error?.message ||
        "Payment could not be started.";

      alert(
        Array.isArray(message)
          ? message.join(", ")
          : message,
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">

          <Loader2
            size={40}
            className="animate-spin text-orange-500 mx-auto"
          />

          <p className="mt-3 text-gray-600">
            Loading payment...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // NO ORDER
  // ==========================================

  if (!order) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-orange-50 pb-10">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="sticky top-0 z-20 bg-white border-b border-orange-100">

        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">

          <button
            onClick={() =>
              navigate(-1)
            }
            disabled={processing}
            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 disabled:opacity-50"
          >
            <ArrowLeft size={20} />
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

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ====================================
            AMOUNT
        ==================================== */}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 mb-5 text-center">

          <p className="text-sm text-gray-500">
            Amount to Pay
          </p>

          <p className="text-4xl font-bold text-orange-600 mt-2">
            ৳
            {Number(
              order.totalAmount,
            ).toFixed(2)}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Customer:{" "}
            {order.customerName ||
              "Customer"}
          </p>

        </div>

        {/* ====================================
            PAYMENT METHOD
        ==================================== */}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">

          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Select Payment Method
          </h2>

          <div className="space-y-3">

            {PAYMENT_OPTIONS.map(
              (option) => {
                const Icon =
                  option.icon;

                const selected =
                  method ===
                  option.id;

                return (
                  <button
                    key={
                      option.id
                    }
                    onClick={() =>
                      setMethod(
                        option.id,
                      )
                    }
                    disabled={
                      processing
                    }
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition ${
                      selected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        selected
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon
                        size={22}
                      />
                    </div>

                    <div className="flex-1">

                      <p className="font-bold text-gray-900">
                        {
                          option.title
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        {
                          option.subtitle
                        }
                      </p>

                    </div>

                    {selected && (
                      <CheckCircle2
                        size={22}
                        className="text-orange-500"
                      />
                    )}

                  </button>
                );
              },
            )}

          </div>

        </div>

        {/* ====================================
            ONLINE PAYMENT INFORMATION
        ==================================== */}

        {method !==
          "CASH" && (
          <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">

            <div className="flex gap-3">

              <LockKeyhole
                size={22}
                className="text-green-600 flex-shrink-0"
              />

              <div>

                <p className="font-semibold text-green-800">
                  Secure Online Payment
                </p>

                <p className="text-sm text-green-700 mt-1">
                  You will be redirected to the
                  SSLCOMMERZ secure payment gateway.
                  Your payment information will be
                  entered securely there.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ====================================
            CASH INFORMATION
        ==================================== */}

        {method ===
          "CASH" && (
          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">

            <div className="flex gap-3">

              <Banknote
                size={22}
                className="text-yellow-600 flex-shrink-0"
              />

              <div>

                <p className="font-semibold text-yellow-800">
                  Cash Payment
                </p>

                <p className="text-sm text-yellow-700 mt-1">
                  Your payment will remain pending.
                  Please pay the cashier at the
                  restaurant.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ====================================
            PAY BUTTON
        ==================================== */}

        <button
          onClick={
            createPayment
          }
          disabled={
            processing
          }
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm"
        >

          {processing ? (
            <>
              <Loader2
                size={22}
                className="animate-spin"
              />

              Processing...
            </>
          ) : method ===
            "CASH" ? (
            <>
              <Banknote
                size={22}
              />

              Submit Cash Payment
            </>
          ) : (
            <>
              <LockKeyhole
                size={22}
              />

              Continue to Secure Payment
            </>
          )}

        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Online payments are processed through
          SSLCOMMERZ.
        </p>

      </div>

    </div>
  );
};

export default Payment;
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Receipt,
} from "lucide-react";

import api from "../../api/axios";

type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

interface PaymentData {
  id: number;
  orderId: number;
  amount: number | string;
  method: string;
  status: PaymentStatus;
  transactionId?: string | null;
  paidAt?: string | null;
}

interface OrderData {
  id: number;
  orderNumber?: string;
  totalAmount: number | string;
  customerName?: string | null;
}

type ResultStatus = "success" | "failed" | "cancelled" | "unknown";

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const orderIdParam = searchParams.get("orderId");
  const paymentIdParam = searchParams.get("paymentId");

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const resultStatus: ResultStatus =
    statusParam === "success"
      ? "success"
      : statusParam === "failed"
        ? "failed"
        : statusParam === "cancelled"
          ? "cancelled"
          : "unknown";

  useEffect(() => {
    const loadPaymentResult = async () => {
      try {
        setLoading(true);

        let paymentData: PaymentData | null = null;
        let orderData: OrderData | null = null;

        if (paymentIdParam) {
          try {
            const paymentResponse = await api.get(
              `/payments/${paymentIdParam}`,
            );

            paymentData = paymentResponse.data;
          } catch {
            paymentData = null;
          }
        }

        if (!paymentData && orderIdParam) {
          try {
            const paymentResponse = await api.get(
              `/payments/order/${orderIdParam}`,
            );

            const responseData = paymentResponse.data;

            if (Array.isArray(responseData)) {
              paymentData = responseData[0] || null;
            } else {
              paymentData = responseData;
            }
          } catch {
            paymentData = null;
          }
        }

        if (orderIdParam) {
          try {
            const orderResponse = await api.get(
              `/orders/${orderIdParam}`,
            );

            orderData = orderResponse.data;
          } catch {
            orderData = null;
          }
        }

        setPayment(paymentData);
        setOrder(orderData);

        if (paymentData) {
          localStorage.setItem(
            "currentPaymentId",
            String(paymentData.id),
          );

          localStorage.setItem(
            "currentPaymentStatus",
            paymentData.status,
          );
        }
      } catch (error) {
        console.error("Failed to load payment result:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentResult();
  }, [orderIdParam, paymentIdParam]);

  const getAmount = () => {
    if (payment?.amount !== undefined) {
      return Number(payment.amount);
    }

    if (order?.totalAmount !== undefined) {
      return Number(order.totalAmount);
    }

    return 0;
  };

  const formatAmount = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const handleTracking = () => {
    if (orderIdParam) {
      navigate(`/customer/order-tracking/${orderIdParam}`);
    }
  };

  const handleTryAgain = () => {
    if (orderIdParam) {
      navigate(`/customer/payment/${orderIdParam}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />

          <h2 className="text-lg font-semibold text-gray-800">
            Checking payment status...
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Please wait while we verify your payment.
          </p>
        </div>
      </div>
    );
  }

  if (resultStatus === "success" || payment?.status === "PAID") {
    return (
      <div className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="bg-green-50 px-6 py-8 text-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />

              <h1 className="text-2xl font-bold text-gray-900">
                Payment Successful
              </h1>

              <p className="text-sm text-gray-600 mt-2">
                Your payment has been successfully completed.
              </p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Order
                  </span>

                  <span className="font-semibold text-gray-900">
                    {order?.orderNumber || `#${orderIdParam}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Amount
                  </span>

                  <span className="font-bold text-orange-600">
                    {formatAmount(getAmount())}
                  </span>
                </div>

                {payment?.method && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Payment Method
                    </span>

                    <span className="font-medium text-gray-900">
                      {payment.method}
                    </span>
                  </div>
                )}

                {payment?.transactionId && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-500">
                      Transaction ID
                    </span>

                    <span className="text-sm font-medium text-gray-900 text-right break-all">
                      {payment.transactionId}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleTracking}
                disabled={!orderIdParam}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                View Order Tracking
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/customer/menu")}
                className="w-full mt-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-xl transition"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resultStatus === "cancelled") {
    return (
      <div className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-8 text-center">
              <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-4" />

              <h1 className="text-2xl font-bold text-gray-900">
                Payment Cancelled
              </h1>

              <p className="text-sm text-gray-600 mt-2">
                The payment process was cancelled before completion.
              </p>
            </div>

            <div className="p-6">
              {orderIdParam && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Order
                    </span>

                    <span className="font-semibold text-gray-900">
                      {order?.orderNumber || `#${orderIdParam}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      Amount
                    </span>

                    <span className="font-bold text-orange-600">
                      {formatAmount(getAmount())}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTryAgain}
                disabled={!orderIdParam}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                Try Payment Again
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleTracking}
                disabled={!orderIdParam}
                className="w-full mt-3 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3.5 rounded-xl transition"
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-8 text-center">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />

            <h1 className="text-2xl font-bold text-gray-900">
              Payment Failed
            </h1>

            <p className="text-sm text-gray-600 mt-2">
              We could not complete your payment. Please try again.
            </p>
          </div>

          <div className="p-6">
            {orderIdParam && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Order
                  </span>

                  <span className="font-semibold text-gray-900">
                    {order?.orderNumber || `#${orderIdParam}`}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">
                    Amount
                  </span>

                  <span className="font-bold text-orange-600">
                    {formatAmount(getAmount())}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <Receipt className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

              <p className="text-sm text-red-700">
                No successful payment was recorded for this
                transaction.
              </p>
            </div>

            <button
              onClick={handleTryAgain}
              disabled={!orderIdParam}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              Try Payment Again
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleTracking}
              disabled={!orderIdParam}
              className="w-full mt-3 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3.5 rounded-xl transition"
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
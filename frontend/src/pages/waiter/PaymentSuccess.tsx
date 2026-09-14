import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  Utensils,
  Receipt,
  Loader2,
} from "lucide-react";

import api from "../../api/axios";

interface Payment {
  id: number;
  method: string;
  status: string;
  amount: number | string;
  transactionId?: string | null;
}

interface Order {
  id: number;
  orderNumber?: string;
  totalAmount?: number | string;
  tableId?: number;
  table?: {
    tableNumber?: number | string;
  };
  payment?: Payment | null;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await api.get(`/orders/${orderId}`);

        setOrder(response.data);
      } catch (error) {
        console.error(
          "Failed to load waiter payment success:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={27}
          className="animate-spin text-emerald-500"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            Payment information not found.
          </p>

          <button
            onClick={() =>
              navigate("/waiter/orders")
            }
            className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const payment = order.payment;

  const total = Number(
    payment?.amount ??
      order.totalAmount ??
      0
  );

  const orderNumber =
    order.orderNumber ??
    `ORD-${order.id}`;

  const tableNumber =
    order.table?.tableNumber ??
    order.tableId ??
    "N/A";

  return (
    <div className="min-h-full px-3 pb-8 pt-5 sm:px-4">
      <div className="mx-auto max-w-2xl">

        {/* SUCCESS */}

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg">
            <CheckCircle2
              size={44}
              className="text-white"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-800">
            Payment Successful
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Customer payment has been recorded.
          </p>
        </div>

        {/* RECEIPT */}

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Receipt size={20} />
              </div>

              <div>
                <p className="text-[10px] text-emerald-50">
                  Order
                </p>

                <h2 className="text-xl font-extrabold">
                  #{orderNumber}
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">

            <div className="flex justify-between">
              <div>
                <p className="text-[10px] text-slate-400">
                  Table
                </p>

                <p className="font-bold text-slate-800">
                  T-{tableNumber}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400">
                  Payment Method
                </p>

                <p className="font-bold text-slate-800">
                  {payment?.method ?? "N/A"}
                </p>
              </div>
            </div>

            {payment?.transactionId && (
              <>
                <div className="border-t border-dashed border-slate-200" />

                <div>
                  <p className="text-[10px] text-slate-400">
                    Transaction ID
                  </p>

                  <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                    {payment.transactionId}
                  </p>
                </div>
              </>
            )}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total Paid
                </span>

                <span className="text-2xl font-extrabold text-emerald-600">
                  ৳{total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={15} />
              PAYMENT PAID
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-5 grid grid-cols-2 gap-3">

          <button
            onClick={() =>
              navigate("/waiter/orders")
            }
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm"
          >
            <Receipt size={17} />
            Orders
          </button>

          <button
            onClick={() =>
              navigate("/waiter")
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-md"
          >
            Dashboard
            <ArrowRight size={17} />
          </button>

        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Utensils
            size={15}
            className="text-emerald-500"
          />

          Customer payment completed successfully.
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
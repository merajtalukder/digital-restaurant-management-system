import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Send,
  Trash2,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

import api from "../../api/axios";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface LocationState {
  tableId: number;
  tableNumber: number | string;
  cart: CartItem[];
  instructions?: string;
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    location.state as LocationState | null;

  const tableId = state?.tableId;
  const tableNumber =
    state?.tableNumber;

  const initialCart =
    state?.cart ?? [];

  const instructions =
    state?.instructions ?? "";

  const [loading, setLoading] =
    useState(false);

  // =========================
  // BILL CALCULATION
  // =========================

  const subtotal = useMemo(
    () =>
      initialCart.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0,
      ),
    [initialCart],
  );

  const total = subtotal;

  // =========================
  // GO BACK
  // =========================

  const goBack = () => {
    if (tableId) {
      navigate(
        `/waiter/order/${tableId}`,
      );
    } else {
      navigate(
        "/waiter/tables",
      );
    }
  };

  // =========================
  // GET CURRENT WAITER
  // =========================

  const getWaiterId = () => {
    const userData =
      localStorage.getItem(
        "user",
      );

    if (!userData) {
      alert(
        "Waiter login information not found.",
      );

      navigate("/login");

      return null;
    }

    try {
      const currentUser =
        JSON.parse(userData);

      const waiterId =
        Number(
          currentUser?.id,
        );

      if (!waiterId) {
        alert(
          "Invalid waiter information.",
        );

        return null;
      }

      if (
        String(
          currentUser?.role,
        ).toUpperCase() !==
        "WAITER"
      ) {
        alert(
          "Only a waiter can create this order.",
        );

        return null;
      }

      return waiterId;
    } catch {
      alert(
        "Invalid waiter login information.",
      );

      localStorage.removeItem(
        "user",
      );

      navigate("/login");

      return null;
    }
  };

  // =========================
  // CREATE ORDER
  // =========================

  const createOrder =
    async () => {
      try {
        const waiterId =
          getWaiterId();

        if (!waiterId) {
          return null;
        }

        if (!tableId) {
          alert(
            "Table information missing.",
          );

          return null;
        }

        if (
          !initialCart.length
        ) {
          alert(
            "Please add at least one item.",
          );

          return null;
        }

        const payload = {
          customerName:
            undefined,

          orderType:
            "WAITER",

          tableId:
            Number(tableId),

          waiterId,

          items:
            initialCart.map(
              (item) => ({
                menuItemId:
                  Number(item.id),

                quantity:
                  Number(
                    item.quantity,
                  ),
              }),
            ),
        };

        // =========================
        // CREATE ORDER ONLY
        // =========================

        const response =
          await api.post(
            "/orders",
            payload,
          );

        const order =
          response.data;

        if (!order?.id) {
          console.error(
            "Order response:",
            order,
          );

          alert(
            "Order was created, but order ID was not returned.",
          );

          return null;
        }

        /*
         * IMPORTANT:
         *
         * DO NOT create payment here.
         *
         * New flow:
         *
         * Order created
         *       ↓
         * Payment = null
         *       ↓
         * If Pay Now:
         * Payment page
         *       ↓
         * POST /payments
         *       ↓
         * PENDING
         */

        return order;
      } catch (error: any) {
        console.error(
          "Failed to create order:",
          error,
        );

        const message =
          error?.response?.data
            ?.message ||
          "Failed to create order. Please try again.";

        alert(
          Array.isArray(message)
            ? message.join(", ")
            : message,
        );

        return null;
      }
    };

  // =========================
  // PAY NOW
  // =========================

  const handlePayNow =
    async () => {
      if (loading) return;

      setLoading(true);

      try {
        const order =
          await createOrder();

        if (!order) return;

        const orderId =
          Number(order.id);

        if (!orderId) {
          alert(
            "Order ID could not be found.",
          );

          return;
        }

        // Go to payment page.
        //
        // Payment will NOT be created
        // until waiter clicks Pay there.

        navigate(
          `/waiter/payment/${orderId}`,
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // PAY LATER
  // =========================

  const handlePayLater =
    async () => {
      if (loading) return;

      setLoading(true);

      try {
        const order =
          await createOrder();

        if (!order) return;

        /*
         * No payment is created.
         *
         * Order exists.
         * Payment will be created
         * later when someone pays.
         */

        navigate(
          "/waiter/orders",
          {
            state: {
              success: true,

              message:
                "Order sent to kitchen. Payment can be collected later.",
            },
          },
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // INVALID STATE
  // =========================

  if (
    !state ||
    !tableId
  ) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UtensilsCrossed
              size={30}
            />
          </div>

          <h2 className="text-xl font-black text-slate-900">
            Order information missing
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please go back and create the order again.
          </p>

          <button
            onClick={() =>
              navigate(
                "/waiter/tables",
              )
            }
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20"
          >
            Back to Tables
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-8">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <button
          onClick={goBack}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ArrowLeft
            size={19}
          />
        </button>

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Waiter Panel
          </p>

          <h1 className="text-2xl font-black text-slate-900">
            Confirm Order
          </h1>

        </div>
      </div>

      {/* TABLE */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/10">

        <div className="rounded-[23px] bg-white p-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Serving Table
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Table{" "}
                {tableNumber}
              </h2>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <UtensilsCrossed
                size={24}
              />
            </div>

          </div>

        </div>
      </div>

      {/* ITEMS */}

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-black text-slate-900">
              Order Items
            </h2>

            <p className="text-xs text-slate-400">
              {
                initialCart.length
              }{" "}
              item
              {initialCart.length !==
              1
                ? "s"
                : ""}
            </p>

          </div>

          <CheckCircle2
            className="text-emerald-500"
            size={23}
          />

        </div>

        <div className="space-y-3">

          {initialCart.map(
            (item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >

                {/* IMAGE */}

                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50">

                  {item.image ? (
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-emerald-500">
                      <UtensilsCrossed
                        size={22}
                      />
                    </div>
                  )}

                </div>

                {/* INFO */}

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-sm font-black text-slate-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-emerald-600">
                    ৳
                    {Number(
                      item.price,
                    ).toFixed(2)}
                  </p>

                </div>

                {/* QUANTITY */}

                <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm">

                  <button
                    disabled
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300"
                  >
                    <Minus
                      size={15}
                    />
                  </button>

                  <span className="min-w-[20px] text-center text-sm font-black text-slate-800">
                    {
                      item.quantity
                    }
                  </span>

                  <button
                    disabled
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300"
                  >
                    <Plus
                      size={15}
                    />
                  </button>

                </div>

                {/* ITEM TOTAL */}

                <div className="hidden w-24 text-right sm:block">

                  <p className="text-sm font-black text-slate-900">
                    ৳
                    {(
                      Number(
                        item.price,
                      ) *
                      Number(
                        item.quantity,
                      )
                    ).toFixed(2)}
                  </p>

                </div>

                <Trash2
                  size={17}
                  className="text-slate-200"
                />

              </div>
            ),
          )}

        </div>
      </div>

      {/* INSTRUCTIONS */}

      {instructions.trim() && (
        <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">

          <p className="text-xs font-black uppercase tracking-wider text-violet-500">
            Special Instructions
          </p>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
            {instructions}
          </p>

        </div>
      )}

      {/* BILL */}

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-black text-slate-900">
          Order Summary
        </h2>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between text-slate-500">

            <span>
              Subtotal
            </span>

            <span className="font-bold text-slate-800">
              ৳
              {subtotal.toFixed(
                2,
              )}
            </span>

          </div>

          <div className="my-3 border-t border-dashed border-slate-200" />

          <div className="flex items-center justify-between">

            <span className="text-base font-black text-slate-900">
              Total
            </span>

            <span className="text-2xl font-black text-emerald-600">
              ৳
              {total.toFixed(
                2,
              )}
            </span>

          </div>

        </div>
      </div>

      {/* PAYMENT INFO */}

      <div className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-5">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
            <WalletCards
              size={20}
            />
          </div>

          <div>

            <h3 className="text-sm font-black text-slate-900">
              Payment Option
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              You can take payment now,
              or send the order to the
              kitchen and collect payment
              later.
            </p>

            <p className="mt-2 text-xs font-semibold text-cyan-700">
              Payment will be created
              only when Pay is selected.
            </p>

          </div>

        </div>
      </div>

      {/* ACTIONS */}

      <div className="grid gap-3 sm:grid-cols-3">

        {/* EDIT */}

        <button
          onClick={goBack}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ArrowLeft
            size={18}
          />

          Edit Order
        </button>

        {/* PAY LATER */}

        <button
          onClick={
            handlePayLater
          }
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Send
              size={18}
            />
          )}

          Pay Later
        </button>

        {/* TAKE PAYMENT */}

        <button
          onClick={
            handlePayNow
          }
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <CreditCard
              size={18}
            />
          )}

          Take Payment
        </button>

      </div>
    </div>
  );
};

export default OrderConfirmation;
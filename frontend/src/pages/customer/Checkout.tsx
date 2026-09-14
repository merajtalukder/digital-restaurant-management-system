import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CreditCard,
  Clock3,
  User,
  Phone,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageSquareText,
  ChefHat,
} from "lucide-react";

import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    totalAmount,
    clearCart,
    customerTableNumber,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async (
    paymentType: "NOW" | "LATER"
  ) => {
    setError("");

    // CART
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // NAME
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // PHONE
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    // TABLE
    if (!customerTableNumber) {
      setError(
        "Table information is missing. Please scan the table QR code again."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      // =========================
      // GET TABLE
      // =========================

      const tablesResponse = await api.get("/tables");

      const tables = tablesResponse.data;

      const selectedTable = tables.find(
        (table: any) =>
          Number(table.tableNumber) ===
          Number(customerTableNumber)
      );

      if (!selectedTable) {
        setError("Table not found.");
        return;
      }

      // =========================
      // CHECK TABLE STATUS
      // =========================

      if (selectedTable.status !== "AVAILABLE") {
        setError(
          "This table is currently not available."
        );
        return;
      }

      // =========================
      // ORDER DATA
      // =========================

      const orderData = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        orderType: "QR",
        tableId: selectedTable.id,

        items: cartItems.map((item) => ({
          menuItemId: Number(item.id),
          quantity: Number(item.quantity),

          // SPECIAL INSTRUCTIONS
          specialInstructions:
            item.specialInstructions?.trim() || undefined,
        })),
      };

      console.log(
        "SENDING REAL ORDER:",
        orderData
      );

      // =========================
      // CREATE ORDER
      // =========================

      const response = await api.post(
        "/orders",
        orderData
      );

      const order = response.data;

      console.log(
        "REAL ORDER CREATED:",
        order
      );

      // =========================
      // SAVE ORDER
      // =========================

      localStorage.setItem(
        "currentOrderId",
        String(order.id)
      );

      if (order.orderNumber) {
        localStorage.setItem(
          "currentOrderNumber",
          String(order.orderNumber)
        );
      }

      localStorage.setItem(
        "currentOrderAmount",
        String(order.totalAmount)
      );

      // =========================
      // PAY LATER
      // =========================

      if (paymentType === "LATER") {
        const paymentData = {
          orderId: Number(order.id),
          amount: Number(order.totalAmount),
          method: "CASH",
          status: "PENDING",
        };

        console.log(
          "CREATING PAY LATER PAYMENT:",
          paymentData
        );

        const paymentResponse = await api.post(
          "/payments",
          paymentData
        );

        const payment = paymentResponse.data;

        console.log(
          "PAY LATER PAYMENT CREATED:",
          payment
        );

        // =========================
        // SAVE PAYMENT
        // =========================

        localStorage.setItem(
          "currentPaymentId",
          String(payment.id)
        );

        localStorage.setItem(
          "currentPaymentStatus",
          String(payment.status)
        );

        // =========================
        // CLEAR CART
        // =========================

        clearCart();

        // =========================
        // GO TO TRACKING
        // =========================

        navigate(
          `/customer/order-tracking/${order.id}`
        );

        return;
      }

      // =========================
      // PAY NOW
      // =========================

      /*
       * IMPORTANT:
       * Do NOT create a CASH payment here.
       *
       * The Payment page will create the actual
       * selected payment method and initiate
       * SSLCOMMERZ when required.
       */

      localStorage.removeItem("currentPaymentId");
      localStorage.removeItem("currentPaymentStatus");

      // =========================
      // CLEAR CART
      // =========================

      clearCart();

      // =========================
      // GO TO PAYMENT
      // =========================

      navigate(
        `/customer/payment/${order.id}`
      );
    } catch (err: any) {
      console.error(
        "ORDER/PAYMENT FAILED:",
        err
      );

      console.log(
        "API ERROR RESPONSE:",
        err?.response?.data
      );

      const message =
        err?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(
          message ||
            "Failed to place order. Please try again."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================
  // EMPTY CART
  // =========================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-full bg-slate-50 px-3 py-4 sm:px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <ShoppingBag size={30} />
            </div>

            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Your Cart is Empty
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please add some items before checkout.
            </p>

            <button
              onClick={() =>
                navigate("/customer/menu")
              }
              className="
                mt-5 w-full rounded-2xl
                bg-gradient-to-r
                from-emerald-500
                via-teal-500
                to-cyan-500
                py-3
                text-sm font-semibold
                text-white
                shadow-md
                transition-all
                hover:shadow-lg
              "
            >
              Go To Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // CHECKOUT PAGE
  // =========================

  return (
    <div className="min-h-full bg-slate-50 px-3 pb-24 pt-3 sm:px-4">
      <div className="mx-auto max-w-md">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={placingOrder}
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl
              bg-white
              text-slate-600
              shadow-sm
              transition
              hover:bg-emerald-50
              hover:text-emerald-600
              disabled:opacity-50
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Checkout
            </h1>

            <p className="text-xs text-slate-500">
              Complete your order
            </p>
          </div>
        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div
          className="
            mb-4 rounded-2xl
            border border-emerald-100
            bg-gradient-to-r
            from-emerald-50
            via-teal-50
            to-cyan-50
            p-4
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Ordering from
              </p>

              <p className="mt-0.5 text-lg font-bold text-emerald-600">
                Table T-
                {String(customerTableNumber).padStart(
                  2,
                  "0"
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            className="
              mb-4 flex items-start gap-3
              rounded-2xl
              border border-red-100
              bg-red-50
              p-3.5
              text-red-600
            "
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            CUSTOMER INFORMATION
        ========================= */}

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
              <User size={17} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Customer Information
              </h2>

              <p className="text-[11px] text-slate-400">
                Enter your details
              </p>
            </div>
          </div>

          <div className="space-y-3">

            {/* NAME */}

            <div className="relative">
              <User
                size={17}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                disabled={placingOrder}
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  py-3 pl-10 pr-3
                  text-sm text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-emerald-100
                  disabled:bg-slate-100
                "
              />
            </div>

            {/* PHONE */}

            <div className="relative">
              <Phone
                size={17}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                disabled={placingOrder}
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  py-3 pl-10 pr-3
                  text-sm text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-cyan-100
                  disabled:bg-slate-100
                "
              />
            </div>
          </div>
        </div>

        {/* =========================
            ORDER SUMMARY
        ========================= */}

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
              <ShoppingBag size={17} />
            </div>

            <h2 className="text-base font-bold text-slate-800">
              Order Summary
            </h2>
          </div>

          <div className="space-y-2.5">
            {cartItems.map((item) => {
              const hasInstructions =
                Boolean(
                  item.specialInstructions?.trim()
                );

              return (
                <div
                  key={`${item.id}-${item.specialInstructions || ""}`}
                  className="
                    rounded-xl
                    bg-slate-50
                    px-3 py-2.5
                  "
                >

                  {/* ITEM + PRICE */}

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {item.name}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-700">
                      ৳
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* SPECIAL INSTRUCTIONS */}

                  {hasInstructions && (
                    <div
                      className="
                        mt-2
                        rounded-lg
                        border border-amber-100
                        bg-amber-50
                        px-2.5 py-2
                      "
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquareText
                          size={14}
                          className="mt-0.5 shrink-0 text-amber-500"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Special Instructions
                            </p>

                            <ChefHat
                              size={11}
                              className="text-amber-500"
                            />
                          </div>

                          <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                            {item.specialInstructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="my-3 border-t border-dashed border-slate-200" />

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">
                Total
              </span>

              <span className="text-xl font-bold text-emerald-600">
                ৳{Number(totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            PAYMENT OPTIONS
        ========================= */}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-800">
              Choose Payment Option
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Select how you want to pay
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* =========================
                PAY NOW
            ========================= */}

            <button
              type="button"
              onClick={() =>
                handlePlaceOrder("NOW")
              }
              disabled={placingOrder}
              className="
                group rounded-2xl
                border-2 border-emerald-200
                bg-emerald-50/50
                p-4 text-left
                transition-all
                hover:border-emerald-400
                hover:bg-emerald-50
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-emerald-500
                    to-teal-500
                    text-white
                    shadow-sm
                  "
                >
                  <CreditCard size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800">
                    Pay Now
                  </h3>

                  <p className="text-xs text-slate-500">
                    Pay securely now
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] font-medium text-emerald-600">
                bKash • Nagad • Card • Cash
              </p>
            </button>

            {/* =========================
                PAY LATER
            ========================= */}

            <button
              type="button"
              onClick={() =>
                handlePlaceOrder("LATER")
              }
              disabled={placingOrder}
              className="
                group rounded-2xl
                border-2 border-violet-200
                bg-violet-50/50
                p-4 text-left
                transition-all
                hover:border-violet-400
                hover:bg-violet-50
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500
                    to-fuchsia-500
                    text-white
                    shadow-sm
                  "
                >
                  <Clock3 size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800">
                    Pay Later
                  </h3>

                  <p className="text-xs text-slate-500">
                    Pay after placing order
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] font-medium text-violet-600">
                Pay later from Track Order
              </p>
            </button>
          </div>

          {/* =========================
              LOADING
          ========================= */}

          {placingOrder && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />

              <p className="text-xs font-medium text-slate-500">
                Creating your order...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;

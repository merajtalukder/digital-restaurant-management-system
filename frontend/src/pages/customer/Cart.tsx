import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Utensils,
  MessageSquareText,
  ChefHat,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

const Cart = () => {
  const [searchParams] = useSearchParams();

  const tableId = searchParams.get("tableId");

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
  } = useCart();

  const tableQuery = tableId
    ? `?tableId=${tableId}`
    : "";

  // =========================
  // EMPTY CART
  // =========================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <ShoppingBag size={30} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-800">
            Your Cart is Empty
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add some delicious items to your cart.
          </p>

          <Link
            to={`/customer/menu${tableQuery}`}
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
              transition-all
              hover:shadow-lg
            "
          >
            Browse Menu
            <ArrowRight size={17} />
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-3 pb-24 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-3xl">

        {/* =========================
            PAGE TITLE
        ========================= */}

        <div className="mb-4 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <ShoppingBag size={19} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Your Cart
              </h1>

              <p className="text-[11px] text-slate-400">
                Review your selected items
              </p>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="
              flex items-center gap-1.5
              rounded-xl
              px-2.5 py-2
              text-xs font-semibold
              text-red-500
              transition
              hover:bg-red-50
            "
          >
            <Trash2 size={15} />
            Clear
          </button>

        </div>

        {/* =========================
            TABLE INFO
        ========================= */}

        {tableId && (
          <div
            className="
              mb-4 flex items-center gap-3
              rounded-2xl
              border border-emerald-100
              bg-gradient-to-r
              from-emerald-50
              via-teal-50
              to-cyan-50
              p-3.5
            "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
              <Utensils size={18} />
            </div>

            <div>
              <p className="text-[11px] text-slate-500">
                Ordering from
              </p>

              <p className="text-sm font-bold text-emerald-600">
                Table T-
                {String(tableId).padStart(2, "0")}
              </p>
            </div>
          </div>
        )}

        {/* =========================
            CART ITEMS
        ========================= */}

        <div className="space-y-3">

          {cartItems.map((item) => {

            const hasInstructions =
              Boolean(item.specialInstructions?.trim());

            return (
              <div
                key={`${item.id}-${item.specialInstructions || ""}`}
                className="
                  rounded-2xl
                  bg-white
                  p-3.5
                  shadow-sm
                  transition
                  hover:shadow-md
                "
              >

                {/* =========================
                    ITEM
                ========================= */}

                <div className="flex items-center justify-between gap-3">

                  <div className="min-w-0 flex-1">

                    <h2 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                      {item.name}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      ৳{Number(item.price).toFixed(2)} ×{" "}
                      {item.quantity}
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      ৳
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </p>

                  </div>

                  {/* =========================
                      QUANTITY
                  ========================= */}

                  <div className="flex shrink-0 items-center gap-1.5">

                    <button
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-slate-100
                        text-slate-600
                        transition
                        hover:bg-slate-200
                      "
                    >
                      <Minus size={15} />
                    </button>

                    <span className="flex min-w-[25px] justify-center text-sm font-bold text-slate-700">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-emerald-500
                        to-teal-500
                        text-white
                        shadow-sm
                        transition
                        hover:shadow-md
                      "
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>

                {/* =========================
                    SPECIAL INSTRUCTIONS
                ========================= */}

                {hasInstructions && (
                  <div
                    className="
                      mt-3
                      rounded-xl
                      border border-amber-100
                      bg-amber-50
                      p-3
                    "
                  >

                    <div className="flex items-start gap-2">

                      <div
                        className="
                          mt-0.5
                          flex h-7 w-7 shrink-0
                          items-center justify-center
                          rounded-lg
                          bg-white
                          text-amber-500
                          shadow-sm
                        "
                      >
                        <MessageSquareText size={15} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                            Special Instructions
                          </p>

                          <ChefHat
                            size={13}
                            className="text-amber-500"
                          />
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {item.specialInstructions}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =========================
                    NO INSTRUCTION MESSAGE
                ========================= */}

                {!hasInstructions && (
                  <div
                    className="
                      mt-3
                      flex items-center gap-2
                      rounded-xl
                      border border-slate-100
                      bg-slate-50
                      px-3 py-2
                    "
                  >
                    <MessageSquareText
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-[11px] text-slate-400">
                      No special instructions
                    </p>
                  </div>
                )}

                {/* =========================
                    REMOVE
                ========================= */}

                <div className="mt-2.5 flex justify-end border-t border-slate-100 pt-2">

                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="
                      flex items-center gap-1
                      text-[11px] font-medium
                      text-red-400
                      transition
                      hover:text-red-500
                    "
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>

                </div>

              </div>
            );
          })}

        </div>

        {/* =========================
            TOTAL
        ========================= */}

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400">
                Total Amount
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-800">
                Order Total
              </p>
            </div>

            <span className="text-xl font-bold text-emerald-600">
              ৳{Number(totalAmount).toFixed(2)}
            </span>

          </div>

          {/* =========================
              CHECKOUT
          ========================= */}

          <Link
            to={`/customer/checkout${tableQuery}`}
            className="
              mt-4 flex items-center justify-center gap-2
              rounded-2xl
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
            Proceed to Checkout
            <ArrowRight size={17} />
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Cart;
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";

import {
  Utensils,
  ShoppingCart,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

const CustomerHeader = () => {
  const {
    cartItemCount,
    customerTableNumber,
  } = useCart();

  const [searchParams] = useSearchParams();

  const tableId = searchParams.get("table");

  const cartQuery = tableId
    ? `?table=${tableId}`
    : "";

  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-white/95
        backdrop-blur-md
        border-b
        border-slate-100
        shadow-sm
      "
    >
      <div
        className="
          max-w-md
          mx-auto
          px-3
          sm:px-4
          py-2
          flex
          items-center
          justify-between
        "
      >
        {/* =========================
            RESTAURANT INFO
        ========================= */}

        <div className="flex items-center gap-2.5">

          {/* Restaurant Icon */}
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-gradient-to-br
              from-emerald-500
              via-teal-500
              to-cyan-500
              flex
              items-center
              justify-center
              shadow-md
              shadow-emerald-100
              shrink-0
            "
          >
            <Utensils
              size={20}
              className="text-white"
              strokeWidth={2.3}
            />
          </div>

          {/* Restaurant Name + Table */}
          <div className="min-w-0">

            <h1
              className="
                text-sm
                sm:text-base
                font-bold
                text-slate-800
                leading-tight
                truncate
              "
            >
              Restaurant Name
            </h1>

            {customerTableNumber ? (

              <div className="flex items-center gap-1.5 mt-0.5">

                <span
                  className="
                    flex
                    items-center
                    justify-center
                    w-4
                    h-4
                    rounded-full
                    bg-emerald-50
                  "
                >
                  <CircleCheck
                    size={11}
                    className="text-emerald-500"
                    strokeWidth={2.8}
                  />
                </span>

                <p
                  className="
                    text-[11px]
                    sm:text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  Table T-
                  {String(customerTableNumber).padStart(2, "0")}
                </p>

              </div>

            ) : (

              <div className="flex items-center gap-1.5 mt-0.5">

                <span
                  className="
                    flex
                    items-center
                    justify-center
                    w-4
                    h-4
                    rounded-full
                    bg-red-50
                  "
                >
                  <CircleAlert
                    size={11}
                    className="text-red-500"
                    strokeWidth={2.5}
                  />
                </span>

                <p className="text-[11px] text-red-500 font-medium">
                  Table not selected
                </p>

              </div>

            )}

          </div>

        </div>

        {/* =========================
            CART
        ========================= */}

        <Link
          to={`/customer/cart${cartQuery}`}
          className="
            relative
            w-10
            h-10
            rounded-xl
            bg-gradient-to-br
            from-slate-50
            to-slate-100
            border
            border-slate-200
            flex
            items-center
            justify-center
            text-slate-700
            transition-all
            duration-200
            hover:bg-emerald-50
            hover:text-emerald-600
            hover:border-emerald-200
            active:scale-90
            shrink-0
          "
        >

          <ShoppingCart
            size={19}
            strokeWidth={2.2}
          />

          {/* Cart Badge */}
          {cartItemCount > 0 && (

            <span
              className="
                absolute
                -top-1.5
                -right-1.5
                min-w-[19px]
                h-[19px]
                px-1
                rounded-full
                bg-gradient-to-r
                from-violet-500
                to-fuchsia-500
                border-2
                border-white
                text-white
                text-[9px]
                font-bold
                flex
                items-center
                justify-center
                shadow-md
              "
            >
              {cartItemCount}
            </span>

          )}

        </Link>

      </div>
    </header>
  );
};

export default CustomerHeader;
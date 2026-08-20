import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CustomerHeader = () => {

  const {
    cartItemCount,
    customerTableNumber,
  } = useCart();

  return (

    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">

      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* =========================
            RESTAURANT INFO
        ========================= */}

        <div className="flex items-center gap-3">

          {/* Restaurant Icon */}

          <div className="
            w-11
            h-11
            rounded-xl
            bg-orange-500
            flex
            items-center
            justify-center
            shadow-sm
          ">
            <span className="text-xl">
              🍴
            </span>
          </div>


          {/* Restaurant Name + Table */}

          <div>

            <h1 className="
              text-base
              sm:text-lg
              font-bold
              text-gray-800
              leading-tight
            ">
              Restaurant Name
            </h1>


            {customerTableNumber ? (

              <div className="flex items-center gap-1.5 mt-1">

                {/* Online/Active Indicator */}

                <span className="
                  w-2
                  h-2
                  rounded-full
                  bg-green-500
                " />

                <p className="
                  text-xs
                  sm:text-sm
                  text-gray-500
                ">
                  Table T-
                  {String(customerTableNumber).padStart(2, "0")}
                </p>

              </div>

            ) : (

              <div className="flex items-center gap-1.5 mt-1">

                <span className="
                  w-2
                  h-2
                  rounded-full
                  bg-red-500
                " />

                <p className="
                  text-xs
                  sm:text-sm
                  text-red-500
                ">
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
          to="/customer/cart"
          className="
            relative
            w-11
            h-11
            rounded-xl
            bg-gray-100
            flex
            items-center
            justify-center
            transition-all
            duration-200
            hover:bg-orange-50
            hover:shadow-sm
            active:scale-95
          "
        >

          {/* Cart Icon */}

          <span className="text-xl">
            🛒
          </span>


          {/* Cart Badge */}

          {cartItemCount > 0 && (

            <span className="
              absolute
              -top-1
              -right-1
              min-w-[20px]
              h-5
              px-1
              rounded-full
              bg-orange-500
              border-2
              border-white
              text-white
              text-[10px]
              font-bold
              flex
              items-center
              justify-center
            ">

              {cartItemCount}

            </span>

          )}

        </Link>

      </div>

    </header>

  );
};

export default CustomerHeader;
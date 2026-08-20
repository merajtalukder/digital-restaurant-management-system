import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";

const Cart = () => {

  const [searchParams] =
    useSearchParams();

  const tableId =
    searchParams.get("tableId");


  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
  } = useCart();


  const tableQuery =
    tableId
      ? `?tableId=${tableId}`
      : "";


  // =========================
  // EMPTY CART
  // =========================

  if (cartItems.length === 0) {

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Your Cart is Empty
        </h1>

        <p className="text-gray-500 mb-6">
          Add some delicious items to your cart.
        </p>

        <Link
          to={`/customer/menu${tableQuery}`}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Browse Menu
        </Link>

      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto">

      {/* PAGE TITLE */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Your Cart
        </h1>

        <button
          onClick={clearCart}
          className="text-red-500 font-medium hover:text-red-600"
        >
          Clear Cart
        </button>

      </div>


      {/* TABLE INFO */}

      {tableId && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg p-3 mb-5">
          Ordering from Table {tableId}
        </div>
      )}


      {/* CART ITEMS */}

      <div className="space-y-4">

        {cartItems.map((item) => (

          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
          >

            {/* ITEM INFO */}

            <div>

              <h2 className="font-semibold text-lg text-gray-800">
                {item.name}
              </h2>

              <p className="text-gray-500">
                ৳{item.price} × {item.quantity}
              </p>

              <p className="font-semibold text-orange-500 mt-1">
                ৳{item.price * item.quantity}
              </p>

            </div>


            {/* QUANTITY */}

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  decreaseQuantity(item.id)
                }
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>


              <span className="font-semibold min-w-[20px] text-center">
                {item.quantity}
              </span>


              <button
                onClick={() =>
                  increaseQuantity(item.id)
                }
                className="w-8 h-8 rounded-full bg-orange-500 text-white hover:bg-orange-600"
              >
                +
              </button>


              <button
                onClick={() =>
                  removeFromCart(item.id)
                }
                className="ml-3 text-red-500 hover:text-red-600"
              >
                Remove
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* TOTAL */}

      <div className="bg-white mt-6 p-5 rounded-xl shadow">

        <div className="flex justify-between text-lg font-bold">

          <span>
            Total
          </span>

          <span>
            ৳{totalAmount}
          </span>

        </div>


        {/* CHECKOUT */}

        <Link
          to={`/customer/checkout${tableQuery}`}
          className="block text-center mt-5 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Proceed to Checkout
        </Link>

      </div>

    </div>
  );
};

export default Cart;
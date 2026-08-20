import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] overflow-hidden flex items-center justify-center px-4 py-4">

      <div className="bg-white rounded-2xl shadow-lg p-7 text-center max-w-sm w-full">

        {/* Restaurant Logo */}
        <div className="text-4xl mb-3">
          🍽️
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to Our Restaurant
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Order your favorite food easily from our digital menu.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">

          <Link
            to="/customer/menu"
            className="bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            View Menu
          </Link>

          <Link
            to="/customer/cart"
            className="border border-orange-500 text-orange-500 py-2.5 rounded-lg font-semibold hover:bg-orange-50 transition"
          >
            Go To Cart
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Welcome;
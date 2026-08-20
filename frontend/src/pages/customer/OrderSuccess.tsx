import { Link, useParams } from "react-router-dom";


const OrderSuccess = () => {

  const { orderId } = useParams();


  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full max-w-md">


        {/* Success Icon */}

        <div className="text-6xl mb-5">
          ✅
        </div>


        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Order Placed Successfully!
        </h1>


        <p className="text-gray-600 mb-6">
          Thank you for your order. Your food is being prepared.
        </p>



        {/* Order ID */}

        <div className="bg-gray-100 rounded-lg p-4 mb-6">

          <p className="text-gray-500">
            Order ID
          </p>

          <h2 className="text-xl font-bold text-orange-500">
            #{orderId}
          </h2>

        </div>



        {/* Buttons */}

        <div className="space-y-3">


          <Link
            to={`/customer/tracking/${orderId}`}
            className="block bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Track Order
          </Link>



          <Link
            to="/customer"
            className="block border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-50"
          >
            Back To Home
          </Link>


        </div>


      </div>


    </div>
  );
};


export default OrderSuccess;
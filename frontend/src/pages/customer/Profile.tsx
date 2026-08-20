import { Link } from "react-router-dom";


const Profile = () => {

  const customer = {
    name: "Md Rahim",
    phone: "017XXXXXXXX",
    email: "rahim@gmail.com",
  };


  return (
    <div className="py-6">


      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        My Profile
      </h1>



      <div className="bg-white rounded-xl shadow p-6">


        {/* Profile Icon */}

        <div className="flex justify-center mb-5">

          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-5xl">
            👤
          </div>

        </div>



        {/* Information */}

        <div className="space-y-4">


          <div>
            <p className="text-gray-500 text-sm">
              Name
            </p>

            <h2 className="font-semibold text-lg">
              {customer.name}
            </h2>
          </div>



          <div>
            <p className="text-gray-500 text-sm">
              Phone
            </p>

            <h2 className="font-semibold text-lg">
              {customer.phone}
            </h2>
          </div>



          <div>
            <p className="text-gray-500 text-sm">
              Email
            </p>

            <h2 className="font-semibold text-lg">
              {customer.email}
            </h2>
          </div>


        </div>




        <button
          className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Edit Profile
        </button>



        <Link
          to="/customer/orders"
          className="block text-center mt-3 border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold"
        >
          View Orders
        </Link>



      </div>


    </div>
  );
};


export default Profile;
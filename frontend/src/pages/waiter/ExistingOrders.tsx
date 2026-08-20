import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";


const ExistingOrders = () => {


  const navigate = useNavigate();


  const [orders, setOrders] = useState<any[]>([]);



  useEffect(() => {

    fetchOrders();

  }, []);




  const fetchOrders = async () => {

    try {

      const response = await api.get("/orders");

      setOrders(response.data);

    }

    catch(error){

      console.log(
        "Order fetch error:",
        error
      );

    }

  };





  const runningOrders = orders.filter(
    (order)=>
      order.status !== "COMPLETED" &&
      order.status !== "CANCELLED"
  );





  return (

    <div>


      <h1 className="text-3xl font-bold mb-6">
        Add Item Existing Order
      </h1>




      <p className="text-gray-600 mb-5">
        Select running order to add new items
      </p>





      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



        {
          runningOrders.length === 0 ?


          (

            <p className="text-gray-500">
              No running orders found
            </p>

          )


          :


          runningOrders.map((order)=>(


            <div

              key={order.id}

              className="
                bg-white
                p-5
                rounded-xl
                shadow
              "

            >



              <h2 className="text-xl font-bold">

                {order.orderNumber}

              </h2>




              <p className="mt-2">

                Table:

                <span className="font-semibold ml-2">

                  {order.table?.tableNumber}

                </span>

              </p>




              <p>

                Total:

                <span className="font-semibold ml-2">

                  ৳ {Number(order.totalAmount)}

                </span>

              </p>





              <button

                onClick={()=>{

                  navigate(
                    `/waiter/add-item/${order.id}`
                  );

                }}


                className="
                  mt-4
                  w-full
                  bg-orange-500
                  text-white
                  py-2
                  rounded-lg
                  hover:bg-orange-600
                "

              >

                Add Item

              </button>




            </div>


          ))
        }



      </div>



    </div>

  );

};


export default ExistingOrders;
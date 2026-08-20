import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";


const ActiveOrders = () => {


  const [orders, setOrders] = useState<any[]>([]);

  const navigate = useNavigate();




  useEffect(()=>{

    fetchOrders();

  },[]);





  const fetchOrders = async()=>{

    try{

      const response =
        await api.get("/orders");


      setOrders(response.data);


    }
    catch(error){

      console.log(
        "Order fetch error:",
        error
      );

    }

  };







  return (

    <div>


      <h1 className="text-3xl font-bold mb-6">
        Active Orders
      </h1>





      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">



        {
          orders.map((order)=>(


            <div

              key={order.id}

              className="
              bg-white
              p-5
              rounded-xl
              shadow
              "

            >



              <div className="flex justify-between mb-3">


                <h2 className="text-xl font-bold">

                  Order #{order.id}

                </h2>


                <span className="
                bg-yellow-200
                px-3
                py-1
                rounded
                ">

                  {order.status}

                </span>


              </div>






              <p className="mb-2">

                Table:
                {" "}
                {order.table?.tableNumber}

              </p>





              <h3 className="font-semibold mt-3">

                Items:

              </h3>





              {
                order.orderItems?.map((item:any)=>(


                  <div

                    key={item.id}

                    className="flex justify-between border-b py-2"

                  >

                    <span>

                      {item.menuItem.name}
                      {" "}
                      x
                      {item.quantity}

                    </span>



                    <span>

                      ৳ {Number(item.subtotal)}

                    </span>


                  </div>


                ))
              }





              <div className="mt-4 font-bold">

                Total:
                {" "}
                ৳ {Number(order.totalAmount)}

              </div>







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


export default ActiveOrders;
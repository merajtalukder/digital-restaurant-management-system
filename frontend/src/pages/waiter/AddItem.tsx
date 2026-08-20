import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";


const AddItem = () => {


  const { orderId } = useParams();



  const [menuItems,setMenuItems] = useState<any[]>([]);


  const [cart,setCart] = useState<any[]>([]);





  useEffect(()=>{

    fetchMenuItems();

  },[]);






  const fetchMenuItems = async()=>{

    try{

      const response = await api.get("/menu-items");

      setMenuItems(response.data);

    }

    catch(error){

      console.log(
        "Menu fetch error:",
        error
      );

    }

  };








  const addToCart = (item:any)=>{


    const existing = cart.find(
      (cartItem)=>cartItem.id === item.id
    );



    if(existing){


      setCart(

        cart.map((cartItem)=>

          cartItem.id === item.id

          ?

          {
            ...cartItem,
            quantity:cartItem.quantity + 1
          }

          :

          cartItem

        )

      );


    }

    else{


      setCart([

        ...cart,

        {
          ...item,
          quantity:1
        }

      ]);

    }


  };







  const total = cart.reduce(

    (sum,item)=>

      sum + Number(item.price) * item.quantity,

    0

  );








  const updateExistingOrder = async()=>{


    try{


      const data = {


        items:cart.map(item=>({


          menuItemId:item.id,

          quantity:item.quantity


        }))


      };



      const response = await api.patch(

        `/orders/${orderId}`,

        data

      );



      console.log(response.data);



      alert(
        "Item added successfully"
      );


      setCart([]);



    }

    catch(error){


      console.log(
        "Add item error:",
        error
      );


      alert(
        "Failed to add item"
      );


    }


  };









  return (

    <div>


      <h1 className="text-3xl font-bold mb-6">

        Add Item To Order #{orderId}

      </h1>




      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">





        {/* Menu */}

        <div className="bg-white p-5 rounded-xl shadow">


          <h2 className="text-xl font-bold mb-4">

            Menu Items

          </h2>




          {
            menuItems.map(item=>(


              <div

                key={item.id}

                className="
                  flex
                  justify-between
                  border-b
                  py-3
                "

              >



                <div>


                  <h3 className="font-semibold">

                    {item.name}

                  </h3>


                  <p>

                    ৳ {Number(item.price)}

                  </p>


                </div>





                <button

                  onClick={()=>addToCart(item)}

                  className="
                    bg-blue-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                  "

                >

                  Add

                </button>




              </div>


            ))
          }



        </div>







        {/* Cart */}

        <div className="bg-white p-5 rounded-xl shadow">


          <h2 className="text-xl font-bold mb-4">

            New Items

          </h2>




          {
            cart.map(item=>(


              <div

                key={item.id}

                className="flex justify-between border-b py-2"

              >


                <span>

                  {item.name} x{item.quantity}

                </span>


                <span>

                  ৳ {Number(item.price)*item.quantity}

                </span>


              </div>


            ))
          }




          <div className="mt-5 font-bold text-xl">

            Add Total: ৳ {total}

          </div>





          <button

            onClick={updateExistingOrder}

            disabled={cart.length===0}

            className="
              mt-5
              w-full
              bg-green-600
              text-white
              py-3
              rounded-lg
              disabled:bg-gray-400
            "

          >

            Add To Existing Bill

          </button>



        </div>



      </div>



    </div>

  );

};


export default AddItem;
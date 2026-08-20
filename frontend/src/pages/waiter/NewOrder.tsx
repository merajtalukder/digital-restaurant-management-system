import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";


const NewOrder = () => {


  const navigate = useNavigate();


  const [tables, setTables] = useState<any[]>([]);



  useEffect(() => {

    fetchTables();

  }, []);




  const fetchTables = async () => {

    try {

      const response = await api.get("/tables");

      setTables(response.data);

    }

    catch(error){

      console.log(
        "Table fetch error:",
        error
      );

    }

  };




  return (

    <div>


      <h1 className="text-3xl font-bold mb-6">
        New Order
      </h1>



      <p className="mb-5 text-gray-600">
        Select Table For New Order
      </p>





      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">



        {
          tables.map((table)=>(


            <div

              key={table.id}

              className="
                bg-white
                p-5
                rounded-xl
                shadow
              "

            >



              <h2 className="text-xl font-bold">

                Table {table.tableNumber}

              </h2>



              <p className="mt-2">

                Status:

                <span
                  className={`
                    ml-2 font-semibold
                    ${
                      table.status === "AVAILABLE"
                      ?
                      "text-green-600"
                      :
                      "text-red-600"
                    }
                  `}
                >

                  {table.status}

                </span>

              </p>





              <button

                disabled={
                  table.status === "OCCUPIED"
                }


                onClick={()=>{

                  navigate(
                    `/waiter/order/${table.id}`
                  );

                }}


                className={`
                  mt-4
                  w-full
                  py-2
                  rounded-lg
                  text-white

                  ${
                    table.status === "OCCUPIED"

                    ?

                    "bg-gray-400 cursor-not-allowed"

                    :

                    "bg-green-600 hover:bg-green-700"

                  }
                `}

              >

                Select Table

              </button>




            </div>


          ))
        }



      </div>



    </div>

  );

};


export default NewOrder;
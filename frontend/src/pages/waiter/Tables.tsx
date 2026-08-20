import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";


const Tables = () => {

  const [tables, setTables] = useState<any[]>([]);

  const navigate = useNavigate();



  useEffect(() => {
    fetchTables();
  }, []);



  const fetchTables = async () => {

    try {

      const response = await api.get("/tables");

      console.log("API RESPONSE:", response.data);

      setTables(response.data);

    } catch (error) {

      console.log("Error fetching tables:", error);

    }

  };



  return (

    <div>


      <h1 className="text-3xl font-bold mb-6">
        Restaurant Tables
      </h1>



      {
        tables.length === 0 ? (

          <p className="text-gray-500">
            No tables found
          </p>

        ) : (


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">


            {
              tables.map((table)=>(


                <div
                  key={table.id}
                  className="bg-white rounded-xl shadow p-5"
                >


                  <h2 className="text-xl font-bold">
                    Table {table.tableNumber}
                  </h2>



                  <p className="mt-3">

                    Status:

                    <span
                      className={`
                        ml-2 font-semibold
                        ${
                          table.status === "AVAILABLE"
                          ? "text-green-600"
                          :
                          table.status === "OCCUPIED"
                          ? "text-red-600"
                          :
                          "text-yellow-600"
                        }
                      `}
                    >

                      {table.status}

                    </span>

                  </p>



                  <button

                    onClick={() =>
                      navigate(`/waiter/order/${table.id}`)
                    }

                    disabled={table.status === "OCCUPIED"}

                    className={`
                      mt-5 w-full px-4 py-2 rounded-lg text-white
                      ${
                        table.status === "OCCUPIED"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                      }
                    `}

                  >

                    Take Order

                  </button>


                </div>


              ))
            }


          </div>

        )

      }


    </div>

  );
};


export default Tables;
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  status:
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "COMPLETED"
    | "CANCELLED";
  totalAmount: number | string;
  table?: {
    tableNumber: number;
  };
}

const OrderTracking = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ORDER
  // =========================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${orderId}`);

        console.log("Order Tracking:", response.data);

        setOrder(response.data);
      } catch (err: any) {
        console.error("Failed to load order:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load order information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading order status...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !order) {
    return (
      <div className="py-10 text-center">

        <div className="bg-white rounded-xl shadow p-8">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-bold text-gray-800">
            Order Not Found
          </h1>

          <p className="text-gray-500 mt-2">
            {error || "Unable to find this order."}
          </p>

          <Link
            to="/customer/orders"
            className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            View My Orders
          </Link>

        </div>

      </div>
    );
  }

  // =========================
  // STATUS STEPS
  // =========================

  const steps = [
    {
      key: "PENDING",
      title: "Order Placed",
      description: "Your order has been placed.",
    },
    {
      key: "PREPARING",
      title: "Preparing Food",
      description: "Your food is being prepared.",
    },
    {
      key: "READY",
      title: "Ready To Serve",
      description: "Your order is ready.",
    },
    {
      key: "SERVED",
      title: "Served",
      description: "Your order has been served.",
    },
  ];

  // =========================
  // CURRENT STATUS INDEX
  // =========================

  const statusIndex = steps.findIndex(
    (step) => step.key === order.status
  );

  // COMPLETED = final state
  const isCompleted =
    order.status === "COMPLETED";

  // CANCELLED = special state
  const isCancelled =
    order.status === "CANCELLED";

  return (
    <div className="py-6 max-w-2xl mx-auto">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Track Your Order
        </h1>

        <p className="text-gray-500 mt-1">
          Order #{order.orderNumber}
        </p>

      </div>


      {/* =========================
          CANCELLED
      ========================= */}

      {isCancelled && (

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              ✕
            </div>

            <div>

              <h2 className="font-bold text-red-600">
                Order Cancelled
              </h2>

              <p className="text-sm text-red-500 mt-1">
                Unfortunately, this order has been cancelled.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          ORDER INFO
      ========================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-5">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-sm text-gray-500">
              Order Number
            </p>

            <p className="font-bold text-lg text-gray-800">
              #{order.orderNumber}
            </p>

          </div>


          <div className="text-right">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="font-bold text-lg text-orange-500">
              ৳{Number(order.totalAmount)}
            </p>

          </div>

        </div>


        {/* Table */}

        {order.table && (

          <div className="border-t mt-4 pt-4">

            <p className="text-sm text-gray-500">
              Table
            </p>

            <p className="font-semibold text-gray-800">
              T-
              {String(
                order.table.tableNumber
              ).padStart(2, "0")}
            </p>

          </div>

        )}

      </div>


      {/* =========================
          ORDER STATUS
      ========================= */}

      {!isCancelled && (

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Order Status
          </h2>


          <div className="space-y-6">

            {steps.map((step, index) => {

              const completed =
                isCompleted ||
                index < statusIndex;

              const active =
                !isCompleted &&
                index === statusIndex;

              const pending =
                !completed &&
                !active;


              return (

                <div
                  key={step.key}
                  className="flex items-start gap-4"
                >

                  {/* Circle */}

                  <div
                    className={`
                      w-10 h-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      font-bold
                      flex-shrink-0
                      ${
                        completed
                          ? "bg-green-500 text-white"
                          : active
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >

                    {completed
                      ? "✓"
                      : index + 1}

                  </div>


                  {/* Text */}

                  <div className="pt-1">

                    <h3
                      className={`
                        font-semibold
                        ${
                          pending
                            ? "text-gray-400"
                            : "text-gray-800"
                        }
                      `}
                    >
                      {step.title}
                    </h3>


                    {!pending && (

                      <p
                        className={`
                          text-sm mt-1
                          ${
                            active
                              ? "text-orange-500"
                              : "text-gray-500"
                          }
                        `}
                      >
                        {active
                          ? step.description
                          : completed
                          ? "Completed"
                          : ""}
                      </p>

                    )}

                  </div>

                </div>

              );

            })}

          </div>


          {/* =========================
              COMPLETED MESSAGE
          ========================= */}

          {isCompleted && (

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">

              <p className="font-semibold text-green-600">
                ✓ Your order has been completed.
              </p>

            </div>

          )}

        </div>

      )}


      {/* =========================
          BACK TO ORDERS
      ========================= */}

      <Link
        to="/customer/orders"
        className="block text-center mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
      >
        View My Orders
      </Link>

    </div>
  );
};

export default OrderTracking;
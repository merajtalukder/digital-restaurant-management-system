import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Utensils,
  Plus,
  Clock3,
  Receipt,
} from "lucide-react";

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
    } catch (error) {
      console.log("Order fetch error:", error);
    }
  };

  const runningOrders = orders.filter(
    (order) =>
      order.status !== "COMPLETED" &&
      order.status !== "CANCELLED"
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "PREPARING":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";

      case "SERVED":
        return "bg-violet-50 text-violet-700 border-violet-100";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-2xl p-5 text-white shadow-md">

        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <ClipboardList size={19} />
          </div>

          <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
            Order Management
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">

          <div>
            <h1 className="text-2xl font-bold">
              Existing Orders
            </h1>

            <p className="text-sm text-white/80 mt-1">
              Select a running order to add new items.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 w-fit">
            <Clock3 size={16} />
            <span className="text-sm font-semibold">
              {runningOrders.length} Running
            </span>
          </div>

        </div>
      </div>

      {/* Orders */}
      {runningOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
            <ClipboardList size={25} />
          </div>

          <h2 className="font-semibold text-gray-700 mt-4">
            No running orders
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            There are currently no active orders.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {runningOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-emerald-100 transition-all"
            >

              {/* Top */}
              <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 text-emerald-600 flex items-center justify-center">
                    <Receipt size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-800">
                      {order.orderNumber}
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Order #{order.id}
                    </p>
                  </div>

                </div>

                <span
                  className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-2 mt-4">

                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Utensils size={13} />
                    Table
                  </div>

                  <p className="font-semibold text-sm text-gray-700 mt-1">
                    {order.table?.tableNumber
                      ? `Table ${order.table.tableNumber}`
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Receipt size={13} />
                    Total
                  </div>

                  <p className="font-bold text-sm text-emerald-600 mt-1">
                    ৳ {Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>

              </div>

              {/* Action */}
              <button
                onClick={() =>
                  navigate(`/waiter/add-item/${order.id}`)
                }
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-105 transition-all"
              >
                <Plus size={16} />
                Add Item
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default ExistingOrders;
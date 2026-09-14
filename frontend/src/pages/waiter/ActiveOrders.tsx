import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  Plus,
  Receipt,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import api from "../../api/axios";

const ActiveOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      setOrders(response.data);
    } catch (error) {
      console.log("Order fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "PREPARING":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "SERVED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "COMPLETED":
        return "bg-slate-100 text-slate-600 border-slate-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "COMPLETED" &&
      order.status !== "CANCELLED"
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-lg shadow-emerald-200/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <ClipboardList size={20} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-white/75">
                Order Management
              </span>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Active Orders
            </h1>

            <p className="mt-1 text-sm text-white/80">
              Manage ongoing customer orders and add items.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm">
            <ShoppingBag size={18} />

            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/70">
                Active
              </p>
              <p className="text-lg font-bold leading-none">
                {activeOrders.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading active orders...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && activeOrders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <ClipboardList
              size={26}
              className="text-emerald-500"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            No Active Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            There are currently no ongoing orders.
          </p>
        </div>
      )}

      {/* Orders */}
      {!loading && activeOrders.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50">
                    <Receipt
                      size={20}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Order
                    </p>

                    <h2 className="text-base font-bold text-slate-800">
                      #{order.orderNumber || order.id}
                    </h2>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    getStatusStyle(order.status)
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Table Info */}
              <div className="grid grid-cols-2 gap-3 p-4 pb-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Utensils
                      size={16}
                      className="text-emerald-500"
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Table
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {order.table?.tableNumber || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={16}
                      className="text-violet-500"
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {order.status}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="px-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Order Items
                  </h3>

                  <span className="text-[11px] text-slate-400">
                    {order.orderItems?.length || 0} items
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100">
                  {order.orderItems?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {item.menuItem?.name || "Food Item"}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-slate-700">
                        ৳ {Number(item.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total + Action */}
              <div className="mt-4 border-t border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Total Amount
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    ৳ {Number(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/waiter/add-item/${order.id}`
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
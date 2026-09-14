import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Utensils,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock3,
  ChefHat,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

interface MenuItem {
  id: number;
  name: string;
}

interface RestaurantTable {
  id: number;
  tableNumber: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  menuItem: MenuItem;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
  table: RestaurantTable;
  orderItems: OrderItem[];
}

const MyOrders = () => {
  const { customerTableNumber } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders");

        console.log("All Orders:", response.data);
        console.log(
          "Current Customer Table:",
          customerTableNumber
        );

        // =========================
        // FILTER BY CURRENT TABLE
        // =========================

        const tableOrders = response.data.filter(
          (order: Order) =>
            Number(order.table?.tableNumber) ===
            Number(customerTableNumber)
        );

        console.log(
          "Current Table Orders:",
          tableOrders
        );

        setOrders(tableOrders);
      } catch (err: any) {
        console.error(
          "Failed to load orders:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when table is known
    if (customerTableNumber) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [customerTableNumber]);

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100";

      case "PREPARING":
        return "bg-violet-50 text-violet-600 border-violet-100";

      case "READY":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";

      case "SERVED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-100";

      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  // =========================
  // STATUS TEXT
  // =========================

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Order Placed";

      case "PREPARING":
        return "Preparing";

      case "READY":
        return "Ready";

      case "SERVED":
        return "Served";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  // =========================
  // STATUS ICON
  // =========================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock3 size={13} />;

      case "PREPARING":
        return <ChefHat size={13} />;

      case "READY":
        return <Utensils size={13} />;

      case "SERVED":
      case "COMPLETED":
        return <CheckCircle2 size={13} />;

      case "CANCELLED":
        return <XCircle size={13} />;

      default:
        return <Clock3 size={13} />;
    }
  };

  // =========================
  // NO TABLE SELECTED
  // =========================

  if (!customerTableNumber) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-3">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <Utensils size={27} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-800">
            Table Not Selected
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Please enter through your table&apos;s QR code.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <Loader2
              size={23}
              className="animate-spin text-emerald-500"
            />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="px-3 py-8">
        <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-bold">
              Unable to load orders
            </p>

            <p className="mt-1 text-xs leading-5">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // NO ORDERS
  // =========================

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-3">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <ClipboardList size={27} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-800">
            No Orders Yet
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            No orders found for Table{" "}
            {customerTableNumber}.
          </p>

          <Link
            to="/customer/menu"
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Utensils size={16} />
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // ORDERS
  // =========================

  return (
    <div className="min-h-full bg-slate-50 px-3 pb-24 pt-4 sm:px-4 sm:pt-5">
      <div className="mx-auto max-w-2xl">

        {/* TITLE */}

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <ClipboardList size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800">
              My Orders
            </h1>

            <p className="text-[11px] text-slate-500">
              Table {customerTableNumber} • Recent orders
            </p>
          </div>
        </div>

        {/* ORDERS */}

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >

              {/* TOP */}

              <div className="border-b border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-800">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Order ID: #{order.id}
                    </p>
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* ITEMS */}

              <div className="px-4 py-3">
                <div className="space-y-2">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-slate-600">
                          {item.menuItem?.name}
                        </span>

                        <span className="ml-1.5 text-slate-400">
                          × {item.quantity}
                        </span>
                      </div>

                      <span className="shrink-0 font-semibold text-slate-600">
                        ৳
                        {Number(
                          item.subtotal
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTTOM */}

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3">

                <div>
                  <p className="text-[10px] text-slate-400">
                    Total
                  </p>

                  <p className="mt-0.5 text-base font-extrabold text-emerald-600">
                    ৳
                    {Number(
                      order.totalAmount
                    ).toFixed(2)}
                  </p>
                </div>

                {/* TRACK ORDER */}

                <Link
                  to={`/customer/order-tracking/${order.id}`}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                >
                  Track Order
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyOrders;
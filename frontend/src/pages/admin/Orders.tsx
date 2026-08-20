import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

type OrderType = "WAITER" | "QR";

type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

interface MenuItem {
  id: number;
  name: string;
  price: string | number;
}

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
}

interface Waiter {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  menuItem: MenuItem;
}

interface Payment {
  id: number;
  method: string;
  status: PaymentStatus;
  amount: string | number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: string | number;
  table?: Table | null;
  waiter?: Waiter | null;
  orderItems: OrderItem[];
  payment?: Payment | null;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<OrderStatus | "All">("All");
  const [filterType, setFilterType] =
    useState<OrderType | "All">("All");
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/orders`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setError(
        "Could not load orders. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateOrderStatus = async (
    id: number,
    newStatus: OrderStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update order status."
        );
      }

      const updatedOrder = await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                ...updatedOrder,
                status: newStatus,
              }
            : order
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder && currentOrder.id === id
          ? {
              ...currentOrder,
              ...updatedOrder,
              status: newStatus,
            }
          : currentOrder
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order status.");
    }
  };

  // =========================
  // DELETE ORDER
  // =========================

  const deleteOrder = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete order.");
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order.id !== id
        )
      );

      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete order.");
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredOrders = orders.filter((order) => {
    const tableNumber = `T-${String(
      order.table?.tableNumber ?? ""
    ).padStart(2, "0")}`;

    const searchText = search.toLowerCase();

    const matchesSearch =
      order.orderNumber
        .toLowerCase()
        .includes(searchText) ||
      tableNumber
        .toLowerCase()
        .includes(searchText) ||
      order.customerName
        ?.toLowerCase()
        .includes(searchText);

    const matchesStatus =
      filterStatus === "All" ||
      order.status === filterStatus;

    const matchesType =
      filterType === "All" ||
      order.orderType === filterType;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType
    );
  });

  // =========================
  // STATUS TEXT
  // =========================

  const getStatusText = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "PENDING":
        return "Pending";
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
  // STATUS CLASS
  // =========================

  const getStatusClass = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "PREPARING":
        return "bg-blue-100 text-blue-700";
      case "READY":
        return "bg-purple-100 text-purple-700";
      case "SERVED":
        return "bg-indigo-100 text-indigo-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // ORDER TYPE
  // =========================

  const getOrderTypeText = (
    type: OrderType
  ) => {
    return type === "WAITER"
      ? "Waiter Order"
      : "QR Self Order";
  };

  // =========================
  // PAYMENT
  // =========================

  const getPaymentStatus = (
    order: Order
  ): PaymentStatus => {
    return order.payment?.status ?? "PENDING";
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =========================
  // TABLE
  // =========================

  const getTableNumber = (
    table?: Table | null
  ) => {
    if (!table) return "N/A";

    return `T-${String(
      table.tableNumber
    ).padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-w-0">
      {/* ================= HEADER ================= */}

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Orders
        </h2>

        <p className="mt-2 text-gray-600">
          Manage restaurant orders and order status
        </p>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ================= SUMMARY ================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {
              orders.filter(
                (order) =>
                  order.status === "PENDING"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Preparing
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {
              orders.filter(
                (order) =>
                  order.status === "PREPARING"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              orders.filter(
                (order) =>
                  order.status === "COMPLETED"
              ).length
            }
          </p>
        </div>
      </div>

      {/* ================= SEARCH / FILTER ================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search order, table or customer..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Order Type
            </label>

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as
                    | OrderType
                    | "All"
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            >
              <option value="All">
                All Order Types
              </option>

              <option value="WAITER">
                Waiter Order
              </option>

              <option value="QR">
                QR Self Order
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as
                    | OrderStatus
                    | "All"
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            >
              <option value="All">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="PREPARING">
                Preparing
              </option>

              <option value="READY">
                Ready
              </option>

              <option value="SERVED">
                Served
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= ORDER LIST ================= */}

      <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Order List
          </h3>

          <span className="text-sm text-gray-500">
            {filteredOrders.length} order
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500">
            Loading orders...
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[15%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Order
                  </th>

                  <th className="w-[8%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Table
                  </th>

                  <th className="w-[13%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Type
                  </th>

                  <th className="w-[19%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Items
                  </th>

                  <th className="w-[10%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Total
                  </th>

                  <th className="w-[11%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="w-[10%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Payment
                  </th>

                  <th className="w-[14%] px-3 py-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const paymentStatus =
                      getPaymentStatus(order);

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-gray-200"
                      >
                        {/* Order */}

                        <td className="px-3 py-4">
                          <p className="truncate font-medium text-gray-800">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </td>

                        {/* Table */}

                        <td className="px-3 py-4 font-medium text-gray-700">
                          {getTableNumber(
                            order.table
                          )}
                        </td>

                        {/* Type */}

                        <td className="px-3 py-4">
                          <span className="inline-block max-w-full truncate rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {getOrderTypeText(
                              order.orderType
                            )}
                          </span>
                        </td>

                        {/* Items */}

                        <td className="px-3 py-4">
                          <p className="text-sm text-gray-700">
                            {
                              order.orderItems
                                .length
                            }{" "}
                            item
                            {order.orderItems
                              .length !== 1
                              ? "s"
                              : ""}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {order.orderItems
                              .map(
                                (item) =>
                                  `${item.menuItem.name} × ${item.quantity}`
                              )
                              .join(", ")}
                          </p>
                        </td>

                        {/* Total */}

                        <td className="px-3 py-4 font-semibold text-gray-800">
                          ৳
                          {Number(
                            order.totalAmount
                          ).toFixed(2)}
                        </td>

                        {/* Status */}

                        <td className="px-3 py-4">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusText(
                              order.status
                            )}
                          </span>
                        </td>

                        {/* Payment */}

                        <td className="px-3 py-4">
                          {paymentStatus ===
                          "PAID" ? (
                            <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                              Unpaid
                            </span>
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-3 py-4">
                          <div className="flex flex-nowrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                              className="whitespace-nowrap rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteOrder(
                                  order.id
                                )
                              }
                              className="whitespace-nowrap rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Header */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-gray-800">
                  {selectedOrder.orderNumber}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {getTableNumber(
                    selectedOrder.table
                  )}{" "}
                  ·{" "}
                  {getOrderTypeText(
                    selectedOrder.orderType
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="ml-4 shrink-0 text-2xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}

            <div className="overflow-y-auto">
              {/* Customer */}

              {selectedOrder.customerName && (
                <div className="px-5 pt-5">
                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {
                      selectedOrder.customerName
                    }
                  </p>
                </div>
              )}

              {/* Items */}

              <div className="p-5">
                <h4 className="mb-3 font-semibold text-gray-800">
                  Ordered Items
                </h4>

                <div className="space-y-2">
                  {selectedOrder.orderItems.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800">
                            {
                              item.menuItem
                                .name
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            ৳
                            {Number(
                              item.unitPrice
                            ).toFixed(2)}{" "}
                            ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 font-semibold text-gray-800">
                          ৳
                          {Number(
                            item.subtotal
                          ).toFixed(2)}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Total */}

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold text-gray-700">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    ৳
                    {Number(
                      selectedOrder.totalAmount
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Current Status */}

                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Current Status
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusText(
                      selectedOrder.status
                    )}
                  </span>
                </div>

                {/* Update Status */}

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Update Order Status
                  </label>

                  <select
                    value={
                      selectedOrder.status
                    }
                    onChange={(e) =>
                      updateOrderStatus(
                        selectedOrder.id,
                        e.target
                          .value as OrderStatus
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >
                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="PREPARING">
                      Preparing
                    </option>

                    <option value="READY">
                      Ready
                    </option>

                    <option value="SERVED">
                      Served
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  deleteOrder(
                    selectedOrder.id
                  )
                }
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
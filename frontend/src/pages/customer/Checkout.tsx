import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

const Checkout = () => {

  const navigate =
    useNavigate();

  const {
    cartItems,
    totalAmount,
    clearCart,
    customerTableNumber,
  } = useCart();

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async () => {

    setError("");

    // =========================
    // CART VALIDATION
    // =========================

    if (cartItems.length === 0) {

      setError(
        "Your cart is empty."
      );

      return;
    }

    // =========================
    // CUSTOMER NAME
    // =========================

    if (!customerName.trim()) {

      setError(
        "Please enter your name."
      );

      return;
    }

    // =========================
    // PHONE
    // =========================

    if (!phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;
    }

    // =========================
    // TABLE VALIDATION
    // =========================

    if (!customerTableNumber) {

      setError(
        "Table information is missing. Please scan the table QR code again."
      );

      return;
    }

    try {

      setPlacingOrder(true);

      // =========================
      // FIND TABLE BY TABLE NUMBER
      // =========================

      const tablesResponse =
        await api.get("/tables");

      const tables =
        tablesResponse.data;

      const selectedTable =
        tables.find(
          (table: any) =>
            Number(table.tableNumber) ===
            Number(customerTableNumber)
        );

      if (!selectedTable) {

        setError(
          "Table not found."
        );

        return;
      }

      // =========================
      // CHECK TABLE STATUS
      // =========================

      if (
        selectedTable.status !==
        "AVAILABLE"
      ) {

        setError(
          "This table is currently not available."
        );

        return;
      }

      // =========================
      // ORDER DATA
      // =========================

      const orderData = {

        customerName:
          customerName.trim(),

        orderType:
          "QR",

        tableId:
          selectedTable.id,

        items:
          cartItems.map(
            (item) => ({

              menuItemId:
                item.id,

              quantity:
                item.quantity,

            })
          ),

      };

      console.log(
        "Sending Order:",
        orderData
      );

      // =========================
      // CREATE ORDER
      // =========================

      const response =
        await api.post(
          "/orders",
          orderData
        );

      console.log(
        "Order Created:",
        response.data
      );

      const order =
        response.data;

      // =========================
      // CLEAR TABLE CART
      // =========================

      clearCart();

      // =========================
      // SUCCESS PAGE
      // =========================

      navigate(
        `/customer/success/${order.id}`
      );

    } catch (err: any) {

      console.error(
        "Order failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Failed to place order. Please try again."
      );

    } finally {

      setPlacingOrder(false);

    }

  };

  // =========================
  // EMPTY CART
  // =========================

  if (cartItems.length === 0) {

    return (

      <div className="bg-white rounded-xl shadow p-8 text-center">

        <h1 className="text-2xl font-bold text-gray-800">

          Your Cart is Empty

        </h1>

        <p className="text-gray-500 mt-2">

          Please add some items before checkout.

        </p>

        <button
          onClick={() =>
            navigate(
              "/customer/menu"
            )
          }
          className="mt-5 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold"
        >

          Go To Menu

        </button>

      </div>

    );

  }

  return (

    <div>

      {/* =========================
          TITLE
      ========================= */}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">

        Checkout

      </h1>

      {/* =========================
          TABLE INFORMATION
      ========================= */}

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">

        <p className="text-sm text-gray-500">

          Ordering from

        </p>

        <p className="text-lg font-bold text-orange-600">

          Table T-
          {String(
            customerTableNumber
          ).padStart(2, "0")}

        </p>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5">

          {error}

        </div>

      )}

      {/* =========================
          CUSTOMER INFORMATION
      ========================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-5">

        <h2 className="text-lg font-semibold mb-4">

          Customer Information

        </h2>

        <div className="space-y-3">

          <input
            type="text"
            placeholder="Full Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          />

        </div>

      </div>

      {/* =========================
          ORDER SUMMARY
      ========================= */}

      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="text-lg font-semibold mb-4">

          Order Summary

        </h2>

        <div className="space-y-3">

          {cartItems.map(
            (item) => (

              <div
                key={item.id}
                className="flex justify-between text-gray-700"
              >

                <span>

                  {item.name}
                  {" × "}
                  {item.quantity}

                </span>

                <span>

                  ৳
                  {Number(item.price) *
                    item.quantity}

                </span>

              </div>

            )
          )}

          <hr />

          <div className="flex justify-between font-bold text-lg">

            <span>
              Total
            </span>

            <span>
              ৳{totalAmount}
            </span>

          </div>

        </div>

        {/* =========================
            PLACE ORDER
        ========================= */}

        <button
          onClick={
            handlePlaceOrder
          }
          disabled={
            placingOrder
          }
          className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >

          {placingOrder
            ? "Placing Order..."
            : "Place Order"}

        </button>

      </div>

    </div>

  );
};

export default Checkout;
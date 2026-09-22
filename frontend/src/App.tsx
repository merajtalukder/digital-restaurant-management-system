import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// ================= PUBLIC =================

import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";


import UIShowcase from "./pages/UIShowcase.tsx";

// ================= KITCHEN =================

import KitchenStaff from "./pages/kitchen/Kitchen";

// ================= CASHIER =================

import Cashier from "./pages/cashier/Cashier";

// ================= ADMIN =================

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/admin/Dashboard";
import AdminMenu from "./pages/admin/Menu";
import Tables from "./pages/admin/Tables";
import Orders from "./pages/admin/Orders";
import Kitchen from "./pages/admin/Kitchen";
import Users from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// ================= WAITER =================

import WaiterLayout from "./layouts/WaiterLayout";

import WaiterDashboard from "./pages/waiter/Dashboard";
import WaiterTables from "./pages/waiter/Tables";
import TakeOrder from "./pages/waiter/TakeOrder";
import ActiveOrders from "./pages/waiter/ActiveOrders";
import Profile from "./pages/waiter/Profile";
import NewOrder from "./pages/waiter/NewOrder";
import ExistingOrders from "./pages/waiter/ExistingOrders";
import AddItem from "./pages/waiter/AddItem";
import OrderConfirmation from "./pages/waiter/OrderConfirmation";
import WaiterPayment from "./pages/waiter/Payment.tsx";
import WaiterPaymentSuccess from "./pages/waiter/PaymentSuccess.tsx";

// ================= CUSTOMER =================

import CustomerLayout from "./layouts/CustomerLayout";

import Welcome from "./pages/customer/Welcome";
import CustomerMenu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Payment from "./pages/customer/Payment";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderSuccess from "./pages/customer/OrderSuccess";
import MyOrders from "./pages/customer/MyOrders";
import CustomerProfile from "./pages/customer/Profile";
import PaymentResult from "./pages/customer/PaymentResult.tsx";

// ================= KITCHEN LAYOUT =================

import KitchenLayout from "./layouts/KitchenLayout";

// ================= CASHIER LAYOUT =================

import CashierLayout from "./layouts/CashierLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            PUBLIC
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

<Route path="/ui-showcase" element={<UIShowcase />} />


        {/* ==================================================
            KITCHEN PANEL
        ================================================== */}

        <Route
          path="/kitchen"
          element={<KitchenLayout />}
        >
          {/* Kitchen Dashboard */}
          <Route
            index
            element={<KitchenStaff />}
          />

          {/* Kitchen Orders */}
          <Route
            path="orders"
            element={<KitchenStaff />}
          />
        </Route>


        {/* ==================================================
            CASHIER PANEL
        ================================================== */}

        <Route
          path="/cashier"
          element={<CashierLayout />}
        >
          {/* Cashier Dashboard */}
          <Route
            index
            element={<Cashier />}
          />

          {/* Payments */}
          <Route
            path="payments"
            element={<Cashier />}
          />

          {/* Transactions */}
          <Route
            path="transactions"
            element={<Cashier />}
          />
        </Route>


        {/* ==================================================
            ADMIN PANEL
        ================================================== */}

        <Route
          path="/admin"
          element={<DashboardLayout />}
        >
          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* Menu */}
          <Route
            path="menu"
            element={<AdminMenu />}
          />

          {/* Tables */}
          <Route
            path="tables"
            element={<Tables />}
          />

          {/* Orders */}
          <Route
            path="orders"
            element={<Orders />}
          />

          {/* Kitchen */}
          <Route
            path="kitchen"
            element={<Kitchen />}
          />

          {/* Users */}
          <Route
            path="users"
            element={<Users />}
          />

          {/* Reports */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>


        {/* ==================================================
            WAITER PANEL
        ================================================== */}

        <Route
          path="/waiter"
          element={<WaiterLayout />}
        >
          {/* Dashboard */}
          <Route
            index
            element={<WaiterDashboard />}
          />

          {/* Tables */}
          <Route
            path="tables"
            element={<WaiterTables />}
          />

          {/* Take Order */}
          <Route
            path="order/:tableId"
            element={<TakeOrder />}
          />

          {/* Active Orders */}
          <Route
            path="orders"
            element={<ActiveOrders />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* New Order */}
          <Route
            path="new-order"
            element={<NewOrder />}
          />

          {/* Existing Orders */}
          <Route
            path="existing-orders"
            element={<ExistingOrders />}
          />

          {/* Add Item */}
          <Route
            path="add-item"
            element={<AddItem />}
          />

          {/* Add Item for Existing Order */}
          <Route
            path="add-item/:orderId"
            element={<AddItem />}
          />

          {/* Order Confirmation */}
          <Route
            path="order-confirmation"
            element={<OrderConfirmation />}
          />

          {/* Payment */}
          <Route
            path="payment/:orderId"
            element={<WaiterPayment />}
          />

          {/* Payment Success */}
          <Route
            path="payment-success"
            element={<WaiterPaymentSuccess />}
          />
        </Route>


        {/* ==================================================
            CUSTOMER PANEL
        ================================================== */}

        <Route
          path="/customer"
          element={<CustomerLayout />}
        >
          {/* Welcome */}
          <Route
            index
            element={<Welcome />}
          />

          {/* Menu */}
          <Route
            path="menu"
            element={<CustomerMenu />}
          />

          {/* Cart */}
          <Route
            path="cart"
            element={<Cart />}
          />

          {/* Checkout */}
          <Route
            path="checkout"
            element={<Checkout />}
          />

          {/* Payment */}
          <Route
            path="payment/:orderId"
            element={<Payment />}
          />

          {/* Payment Result */}
          <Route
            path="payment-result"
            element={<PaymentResult />}
          />

          {/* Order Tracking */}
          <Route
            path="order-tracking/:orderId"
            element={<OrderTracking />}
          />

          {/* Order Success */}
          <Route
            path="success/:orderId"
            element={<OrderSuccess />}
          />

          {/* My Orders */}
          <Route
            path="orders"
            element={<MyOrders />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<CustomerProfile />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC PAGES =================

import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";

// ================= ADMIN IMPORTS =================

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/admin/Dashboard";
import AdminMenu from "./pages/admin/Menu";
import Tables from "./pages/admin/Tables";
import Orders from "./pages/admin/Orders";
import Kitchen from "./pages/admin/Kitchen";
import Users from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// ================= WAITER IMPORTS =================

import WaiterLayout from "./layouts/WaiterLayout";

import WaiterDashboard from "./pages/waiter/Dashboard";
import WaiterTables from "./pages/waiter/Tables";
import TakeOrder from "./pages/waiter/TakeOrder";
import ActiveOrders from "./pages/waiter/ActiveOrders";
import Profile from "./pages/waiter/Profile";
import NewOrder from "./pages/waiter/NewOrder";
import ExistingOrders from "./pages/waiter/ExistingOrders";
import AddItem from "./pages/waiter/AddItem";

// ================= CUSTOMER IMPORTS =================

import CustomerLayout from "./layouts/CustomerLayout";

import Welcome from "./pages/customer/Welcome";
import CustomerMenu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderSuccess from "./pages/customer/OrderSuccess";
import MyOrders from "./pages/customer/MyOrders";
import CustomerProfile from "./pages/customer/Profile";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC PAGES ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================= ADMIN PANEL ================= */}

        <Route
          path="/admin"
          element={<DashboardLayout />}
        >

          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="menu"
            element={<AdminMenu />}
          />

          <Route
            path="tables"
            element={<Tables />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="kitchen"
            element={<Kitchen />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>


        {/* ================= WAITER PANEL ================= */}

        <Route
          path="/waiter"
          element={<WaiterLayout />}
        >

          <Route
            index
            element={<WaiterDashboard />}
          />

          <Route
            path="tables"
            element={<WaiterTables />}
          />

          <Route
            path="order/:tableId"
            element={<TakeOrder />}
          />

          <Route
            path="orders"
            element={<ActiveOrders />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="new-order"
            element={<NewOrder />}
          />

          <Route
            path="existing-orders"
            element={<ExistingOrders />}
          />

          <Route
            path="add-item"
            element={<AddItem />}
          />

          <Route
            path="add-item/:orderId"
            element={<AddItem />}
          />

        </Route>


        {/* ================= CUSTOMER PANEL ================= */}

        <Route
          path="/customer"
          element={<CustomerLayout />}
        >

          <Route
            index
            element={<Welcome />}
          />

          <Route
            path="menu"
            element={<CustomerMenu />}
          />

          <Route
            path="cart"
            element={<Cart />}
          />

          <Route
            path="checkout"
            element={<Checkout />}
          />

          <Route
            path="tracking/:orderId"
            element={<OrderTracking />}
          />

          <Route
            path="success/:orderId"
            element={<OrderSuccess />}
          />

          <Route
            path="orders"
            element={<MyOrders />}
          />

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
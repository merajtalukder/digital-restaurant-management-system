import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";

import CustomerHeader from "../components/customer/CustomerHeader";
import BottomNavigation from "../components/customer/BottomNavigation";

import { useCart } from "../context/CartContext";

const CustomerLayout = () => {

  const [searchParams] =
    useSearchParams();

  const {
    setCustomerTableNumber,
  } = useCart();

  // =========================
  // GET TABLE FROM URL
  // =========================

  useEffect(() => {

    const table =
      searchParams.get("table");

    if (!table) {
      return;
    }

    const tableNumber =
      Number(table);

    if (
      Number.isInteger(tableNumber) &&
      tableNumber > 0
    ) {

      setCustomerTableNumber(
        tableNumber
      );

    }

  }, [
    searchParams,
    setCustomerTableNumber,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Customer Header */}

      <CustomerHeader />

      {/* Main Content */}

      <main className="px-4 pb-24 pt-4">

        <Outlet />

      </main>

      {/* Bottom Navigation */}

      <BottomNavigation />

    </div>
  );
};

export default CustomerLayout;
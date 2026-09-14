import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";

import CustomerHeader from "../components/customer/CustomerHeader";
import BottomNavigation from "../components/customer/BottomNavigation";
import { useCart } from "../context/CartContext";

const CustomerLayout = () => {
  const [searchParams] = useSearchParams();
  const { setCustomerTableNumber } = useCart();

  useEffect(() => {
    const table = searchParams.get("table");

    if (!table) return;

    const tableNumber = Number(table);

    if (Number.isInteger(tableNumber) && tableNumber > 0) {
      setCustomerTableNumber(tableNumber);
    }
  }, [searchParams, setCustomerTableNumber]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <CustomerHeader />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CustomerLayout;
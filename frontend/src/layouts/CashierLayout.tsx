import { Outlet } from "react-router-dom";
import CashierSidebar from "../components/cashier/CashierSidebar.tsx";

function CashierLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <CashierSidebar />

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default CashierLayout;
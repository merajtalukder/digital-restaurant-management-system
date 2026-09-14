import { Outlet } from "react-router-dom";
import KitchenSidebar from "../components/kitchen/KitchenSidebar";

function KitchenLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <KitchenSidebar />

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default KitchenLayout;
import { Outlet } from "react-router-dom";
import WaiterSidebar from "../components/waiter/WaiterSidebar";

const WaiterLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50">
      {/* Sidebar */}
      <WaiterSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-4 sm:p-5 lg:p-6">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WaiterLayout;
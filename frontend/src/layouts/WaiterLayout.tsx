import { Outlet } from "react-router-dom";
import WaiterSidebar from "../components/waiter/WaiterSidebar";

const WaiterLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">

      {/* Sidebar */}
      <WaiterSidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen p-6">
        <Outlet />
      </div>

    </div>
  );
};

export default WaiterLayout;
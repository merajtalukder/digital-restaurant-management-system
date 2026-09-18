import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  Table2,
  ShoppingBag,
  ChefHat,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Menu",
      path: "/admin/menu",
      icon: Utensils,
    },
    {
      label: "Tables",
      path: "/admin/tables",
      icon: Table2,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Kitchen",
      path: "/admin/kitchen",
      icon: ChefHat,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
  ];

  const isActive = (path: string) =>
    path === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-slate-950 text-white">
        {/* Logo */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
              <Utensils size={20} />
            </div>

            <div>
              <h1 className="text-base font-extrabold">
                Restaurant POS
              </h1>

              <p className="text-[10px] text-slate-400">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map(
            ({ label, path, icon: Icon }) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            }
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-center text-[10px] text-slate-500">
            Restaurant Management System
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
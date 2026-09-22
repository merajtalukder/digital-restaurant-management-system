import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Armchair,
  ClipboardList,
  UserRound,
  UtensilsCrossed,
  ChevronRight,
  LogOut,
} from "lucide-react";

const WaiterSidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/waiter",
      icon: LayoutDashboard,
    },
    {
      name: "Tables",
      path: "/waiter/tables",
      icon: Armchair,
    },
    {
      name: "Orders",
      path: "/waiter/orders",
      icon: ClipboardList,
    },
    
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white shadow-2xl">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
            <UtensilsCrossed size={21} className="text-slate-950" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Waiter Panel
            </h2>
            <p className="text-[11px] text-slate-400">
              Restaurant POS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/waiter"}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-emerald-300"
                      }
                    />

                    <span>{item.name}</span>
                  </div>

                  <ChevronRight
                    size={15}
                    className={`transition-transform ${
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Card */}
      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-cyan-500/10 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <UserRound size={16} className="text-violet-300" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                Waiter Account
              </p>
              <p className="text-[10px] text-slate-400">
                Active
              </p>
            </div>

            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group mt-2 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <div className="flex items-center gap-3">
            <LogOut
              size={18}
              className="text-red-400 group-hover:text-red-300"
            />

            <span>Logout</span>
          </div>

          <ChevronRight
            size={15}
            className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-70"
          />
        </button>
      </div>
    </aside>
  );
};

export default WaiterSidebar;
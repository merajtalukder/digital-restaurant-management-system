import { Link, useLocation, useSearchParams } from "react-router-dom";

import {
  Home,
  Package,
  User,
} from "lucide-react";

const BottomNavigation = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const tableId = searchParams.get("table");

  const tableQuery = tableId
    ? `?table=${tableId}`
    : "";

  const isMenuActive =
    location.pathname === "/customer/menu";

  const isOrdersActive =
    location.pathname === "/customer/orders";

  const isProfileActive =
    location.pathname === "/customer/profile";

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white/95
        backdrop-blur-md
        border-t
        border-slate-200
        shadow-[0_-4px_15px_rgba(0,0,0,0.06)]
      "
    >
      <div
        className="
          max-w-md
          mx-auto
          flex
          items-center
          justify-around
          px-3
          py-1
        "
      >
        {/* MENU */}
        <Link
          to={`/customer/menu${tableQuery}`}
          className={`
            flex
            flex-col
            items-center
            justify-center
            gap-0.5
            min-w-[65px]
            py-1
            rounded-lg
            transition-all
            duration-200
            ${
              isMenuActive
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-500 hover:text-emerald-600"
            }
          `}
        >
          <Home
            size={20}
            strokeWidth={isMenuActive ? 2.5 : 2}
          />

          <span
            className={`
              text-[11px]
              ${
                isMenuActive
                  ? "font-semibold"
                  : "font-medium"
              }
            `}
          >
            Menu
          </span>
        </Link>

        {/* ORDERS */}
        <Link
          to={`/customer/orders${tableQuery}`}
          className={`
            flex
            flex-col
            items-center
            justify-center
            gap-0.5
            min-w-[65px]
            py-1
            rounded-lg
            transition-all
            duration-200
            ${
              isOrdersActive
                ? "text-violet-600 bg-violet-50"
                : "text-slate-500 hover:text-violet-600"
            }
          `}
        >
          <Package
            size={20}
            strokeWidth={isOrdersActive ? 2.5 : 2}
          />

          <span
            className={`
              text-[11px]
              ${
                isOrdersActive
                  ? "font-semibold"
                  : "font-medium"
              }
            `}
          >
            Orders
          </span>
        </Link>

        {/* PROFILE */}
        <Link
          to={`/customer/profile${tableQuery}`}
          className={`
            flex
            flex-col
            items-center
            justify-center
            gap-0.5
            min-w-[65px]
            py-1
            rounded-lg
            transition-all
            duration-200
            ${
              isProfileActive
                ? "text-cyan-600 bg-cyan-50"
                : "text-slate-500 hover:text-cyan-600"
            }
          `}
        >
          <User
            size={20}
            strokeWidth={isProfileActive ? 2.5 : 2}
          />

          <span
            className={`
              text-[11px]
              ${
                isProfileActive
                  ? "font-semibold"
                  : "font-medium"
              }
            `}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
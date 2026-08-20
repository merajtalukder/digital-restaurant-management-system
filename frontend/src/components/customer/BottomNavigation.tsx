import {
  Link,
  useSearchParams,
} from "react-router-dom";

const BottomNavigation = () => {

  const [searchParams] =
    useSearchParams();

  const tableId =
    searchParams.get("tableId");

  const tableQuery =
    tableId
      ? `?tableId=${tableId}`
      : "";

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        bg-white
        border-t
        flex
        justify-around
        py-3
      "
    >

      {/* MENU */}
      <Link
        to={`/customer/menu${tableQuery}`}
      >
        <div className="text-center">
          <div>🏠</div>
          <p>Menu</p>
        </div>
      </Link>


      {/* ORDERS */}
      <Link
        to={`/customer/orders${tableQuery}`}
      >
        <div className="text-center">
          <div>📦</div>
          <p>Orders</p>
        </div>
      </Link>


      {/* PROFILE */}
      <Link
        to={`/customer/profile${tableQuery}`}
      >
        <div className="text-center">
          <div>👤</div>
          <p>Profile</p>
        </div>
      </Link>

    </nav>
  );
};

export default BottomNavigation;
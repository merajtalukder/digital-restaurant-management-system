import { Link } from "react-router-dom";

const WaiterSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-gray-900 text-white p-5">

      <h2 className="text-2xl font-bold mb-8">
        Waiter Panel
      </h2>

      <nav className="space-y-4">

        <Link
          to="/waiter"
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Dashboard
        </Link>

        <Link
          to="/waiter/tables"
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Tables
        </Link>

        <Link
          to="/waiter/orders"
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Orders
        </Link>

        <Link
          to="/waiter/profile"
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Profile
        </Link>

      </nav>

    </aside>
  );
};

export default WaiterSidebar;
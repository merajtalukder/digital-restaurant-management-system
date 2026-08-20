import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white">

        {/* Logo */}

        <div className="border-b border-gray-800 p-6">
          <h1 className="text-2xl font-bold">
            Restaurant POS
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Admin Panel
          </p>
        </div>


        {/* Navigation */}

        <nav className="px-4 py-6">

          {/* Dashboard */}

          <Link
            to="/"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Dashboard
          </Link>


          {/* Menu */}

          <Link
            to="/menu"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Menu
          </Link>


          {/* Tables */}

          <Link
            to="/tables"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Tables
          </Link>


          {/* Orders */}

          <Link
            to="/orders"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Orders
          </Link>


          {/* Kitchen */}

          <Link
            to="/kitchen"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Kitchen
          </Link>


          {/* Users */}

          <Link
            to="/users"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Users
          </Link>


          {/* Reports */}

          <Link
            to="/reports"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Reports
          </Link>


          {/* Settings */}

          <Link
            to="/settings"
            className="mb-2 block rounded-lg px-4 py-3 transition hover:bg-gray-800"
          >
            Settings
          </Link>

        </nav>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="ml-64 min-h-screen p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;
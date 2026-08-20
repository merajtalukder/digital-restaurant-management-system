import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="text-white" size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Restaurant POS
              </h1>
              <p className="text-xs text-gray-500">
                Management System
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-orange-500 transition"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-gray-700 hover:text-orange-500 transition"
            >
              About
            </a>

            <a
              href="#features"
              className="text-gray-700 hover:text-orange-500 transition"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-orange-500 transition"
            >
              How It Works
            </a>
          </div>

          {/* Login */}
          <Link
            to="/login"
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition shadow-sm"
          >
            Login
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
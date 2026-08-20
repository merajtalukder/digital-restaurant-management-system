import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  UserCog,
  UserRound,
  Utensils,
} from "lucide-react";

type LoginRole = "ADMIN" | "WAITER";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<LoginRole>("ADMIN");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // LOGIN FAILED
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      // =========================
      // SAVE LOGIN DATA
      // =========================

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // =========================
      // ROLE BASED REDIRECT
      // =========================

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.role === "WAITER") {
        navigate("/waiter");
      }

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-100 p-4 md:p-6">

      {/* ================= MAIN CARD ================= */}

      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl">

        {/* ================= LOGIN CARD ================= */}

        <div className="w-full max-w-md px-6">

          {/* LOGO */}

          <div className="mb-7 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Utensils size={28} />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Restaurant POS
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage your restaurant
            </p>

          </div>


          {/* LOGIN CARD */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select your role and sign in
              </p>

            </div>


            {/* ================= ROLE SELECTION ================= */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Login As
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* ADMIN */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("ADMIN");
                    setError("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "ADMIN"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        role === "ADMIN"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <UserCog size={20} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Admin
                      </p>

                      <p className="text-xs opacity-70">
                        Management
                      </p>

                    </div>

                  </div>

                </button>


                {/* WAITER */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("WAITER");
                    setError("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "WAITER"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        role === "WAITER"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <UserRound size={20} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Waiter
                      </p>

                      <p className="text-xs opacity-70">
                        Staff
                      </p>

                    </div>

                  </div>

                </button>

              </div>

            </div>


            {/* ================= ERROR ================= */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}


            {/* ================= FORM ================= */}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="mb-4">

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">

                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="mb-6">

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <LogIn size={19} />

                {loading
                  ? "Signing in..."
                  : `Login as ${
                      role === "ADMIN"
                        ? "Admin"
                        : "Waiter"
                    }`}

              </button>

            </form>

          </div>


          {/* BACK HOME */}

          <button
            type="button"
            onClick={() => navigate("/home")}
            disabled={loading}
            className="mt-5 w-full text-center text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            Back to Home
          </button>

        </div>

      </div>

    </div>
  );
};

export default Login;
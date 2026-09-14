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
  ChefHat,
  WalletCards,
} from "lucide-react";

type LoginRole =
  | "ADMIN"
  | "WAITER"
  | "KITCHEN"
  | "CASHIER";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] =
    useState<LoginRole>("ADMIN");

  const [showPassword, setShowPassword] =
    useState(false);

  // Always start with empty values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid email or password"
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      switch (data.user.role) {
        case "ADMIN":
          navigate("/admin");
          break;

        case "WAITER":
          navigate("/waiter");
          break;

        case "KITCHEN":
          navigate("/kitchen");
          break;

        case "CASHIER":
          navigate("/cashier");
          break;

        default:
          setError("Invalid user role.");
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
    <div className="fixed inset-0 overflow-hidden bg-slate-100 p-2 md:p-3">

      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl">

        <div className="w-full max-w-xs px-2">

          {/* LOGO */}

          <div className="mb-3 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Utensils size={20} />
            </div>

            <h1 className="mt-2 text-lg font-bold text-slate-900">
              Restaurant POS
            </h1>

            <p className="text-[10px] text-slate-500">
              Sign in to manage your restaurant
            </p>

          </div>

          {/* LOGIN CARD */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="mb-3">

              <h2 className="text-base font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Select your role and sign in
              </p>

            </div>

            {/* ROLE SELECTION */}

            <div className="mb-3">

              <label className="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Login As
              </label>

              <div className="grid grid-cols-2 gap-1.5">

                {/* ADMIN */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("ADMIN");
                    setError("");
                  }}
                  className={`rounded-lg border p-2 text-left transition ${
                    role === "ADMIN"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        role === "ADMIN"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <UserCog size={15} />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold">
                        Admin
                      </p>

                      <p className="text-[8px] opacity-70">
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
                  className={`rounded-lg border p-2 text-left transition ${
                    role === "WAITER"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        role === "WAITER"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <UserRound size={15} />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold">
                        Waiter
                      </p>

                      <p className="text-[8px] opacity-70">
                        Staff
                      </p>
                    </div>

                  </div>
                </button>

                {/* KITCHEN */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("KITCHEN");
                    setError("");
                  }}
                  className={`rounded-lg border p-2 text-left transition ${
                    role === "KITCHEN"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        role === "KITCHEN"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ChefHat size={15} />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold">
                        Kitchen
                      </p>

                      <p className="text-[8px] opacity-70">
                        Kitchen Staff
                      </p>
                    </div>

                  </div>
                </button>

                {/* CASHIER */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("CASHIER");
                    setError("");
                  }}
                  className={`rounded-lg border p-2 text-left transition ${
                    role === "CASHIER"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        role === "CASHIER"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <WalletCards size={15} />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold">
                        Cashier
                      </p>

                      <p className="text-[8px] opacity-70">
                        Billing
                      </p>
                    </div>

                  </div>
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[10px] font-medium text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleLogin}
              autoComplete="off"
            >

              {/* EMAIL */}

              <div className="mb-2.5">

                <label
                  htmlFor="login-email"
                  className="mb-1 block text-[11px] font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">

                  <UserRound
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-email"
                    name="login-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    autoComplete="off"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="mb-3.5">

                <label
                  htmlFor="login-password"
                  className="mb-1 block text-[11px] font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-password"
                    name="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-9 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={16} />

                {loading
                  ? "Signing in..."
                  : `Login as ${
                      role === "ADMIN"
                        ? "Admin"
                        : role === "WAITER"
                        ? "Waiter"
                        : role === "KITCHEN"
                        ? "Kitchen"
                        : "Cashier"
                    }`}
              </button>

            </form>

          </div>

          {/* BACK HOME */}

          <button
            type="button"
            onClick={() =>
              navigate("/home")
            }
            disabled={loading}
            className="mt-3 w-full text-center text-[10px] font-medium text-slate-500 transition hover:text-blue-600"
          >
            Back to Home
          </button>

        </div>

      </div>

    </div>
  );
};

export default Login;
import { Link, useParams } from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  ArrowRight,
  Home,
} from "lucide-react";

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 sm:px-4">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">

          {/* SUCCESS ICON */}

          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
              <CheckCircle2
                size={34}
                strokeWidth={2.2}
              />
            </div>

            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-500">
              <Clock3 size={15} />
            </div>
          </div>

          {/* TITLE */}

          <h1 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
            Order Placed
            <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Successfully!
            </span>
          </h1>

          {/* MESSAGE */}

          <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-slate-500">
            Thank you for your order. Your food is being prepared.
          </p>

          {/* ORDER ID */}

          <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Order ID
            </p>

            <h2 className="mt-1 text-xl font-bold text-violet-600">
              #{orderId}
            </h2>
          </div>

          {/* STATUS */}

          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-medium text-emerald-600">
            <Clock3 size={15} />
            Your order is being prepared
          </div>

          {/* BUTTONS */}

          <div className="mt-5 space-y-2.5">

            {/* TRACK ORDER */}

            <Link
              to={`/customer/tracking/${orderId}`}
              className="
                flex items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-r
                from-emerald-500
                via-teal-500
                to-cyan-500
                py-3
                text-sm font-semibold
                text-white
                shadow-md
                transition-all
                hover:shadow-lg
              "
            >
              Track Order
              <ArrowRight size={17} />
            </Link>

            {/* HOME */}

            <Link
              to="/customer"
              className="
                flex items-center justify-center gap-2
                rounded-2xl
                border border-slate-200
                bg-white
                py-3
                text-sm font-semibold
                text-slate-600
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-600
              "
            >
              <Home size={16} />
              Back To Home
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
import { Link } from "react-router-dom";
import {
  UserRound,
  Phone,
  Mail,
  Pencil,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

const Profile = () => {
  const customer = {
    name: "Md Rahim",
    phone: "017XXXXXXXX",
    email: "rahim@gmail.com",
  };

  return (
    <div className="mx-auto w-full max-w-lg pb-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your customer information
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Profile Banner */}
        <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Avatar */}
        <div className="-mt-12 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-600 shadow-md">
            <UserRound size={42} strokeWidth={1.8} />
          </div>
        </div>

        {/* Name */}
        <div className="px-5 pt-3 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {customer.name}
          </h2>

          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Customer
          </span>
        </div>

        {/* Information */}
        <div className="space-y-3 p-5">
          <InfoRow
            icon={<UserRound size={18} />}
            label="Name"
            value={customer.name}
            iconClass="bg-violet-50 text-violet-600"
          />

          <InfoRow
            icon={<Phone size={18} />}
            label="Phone"
            value={customer.phone}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={customer.email}
            iconClass="bg-cyan-50 text-cyan-600"
          />
        </div>

        {/* Actions */}
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/60 p-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
          >
            <Pencil size={17} />
            Edit Profile
          </button>

          <Link
            to="/customer/orders"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
          >
            <ShoppingBag size={17} />
            View Orders
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
};

const InfoRow = ({
  icon,
  label,
  value,
  iconClass,
}: InfoRowProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
    >
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="truncate text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  </div>
);

export default Profile;
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  ShoppingBag,
  Save,
  CheckCircle2,
  Phone,
  MapPin,
  Percent,
  Banknote,
  QrCode,
  UserRound,
  Zap,
} from "lucide-react";

const Settings = () => {
  const [restaurantName, setRestaurantName] = useState("Restaurant POS");
  const [phone, setPhone] = useState("01700000000");
  const [address, setAddress] = useState("Uttara, Dhaka");

  const [tax, setTax] = useState("5");
  const [serviceCharge, setServiceCharge] = useState("0");
  const [currency, setCurrency] = useState("BDT");

  const [allowQrOrder, setAllowQrOrder] = useState(true);
  const [allowWaiterOrder, setAllowWaiterOrder] = useState(true);
  const [autoAcceptOrder, setAutoAcceptOrder] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-w-0">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-2.5 text-white shadow-sm">
              <SettingsIcon size={21} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Settings
              </h2>
              <p className="text-sm text-slate-500">
                Manage restaurant and system settings
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Save size={17} />
          Save Settings
        </button>
      </div>

      {/* SUCCESS */}
      {saved && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={18} />
          Settings saved successfully.
        </div>
      )}

      {/* RESTAURANT INFORMATION */}
      <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Store size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              Restaurant Information
            </h3>
            <p className="text-xs text-slate-500">
              Update your restaurant's basic information.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* NAME */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Restaurant Name
            </label>

            <div className="relative">
              <Store
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Address
            </label>

            <div className="relative">
              <MapPin
                size={17}
                className="absolute left-3 top-3 text-slate-400"
              />

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BILLING SETTINGS */}
      <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
            <Receipt size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              Billing Settings
            </h3>
            <p className="text-xs text-slate-500">
              Configure tax, service charge and currency.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* TAX */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Tax (%)
            </label>

            <div className="relative">
              <Percent
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
              />

              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* SERVICE CHARGE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Service Charge (%)
            </label>

            <div className="relative">
              <Receipt
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500"
              />

              <input
                type="number"
                min="0"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* CURRENCY */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Currency
            </label>

            <div className="relative">
              <Banknote
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500"
              />

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              >
                <option value="BDT">BDT — ৳</option>
                <option value="USD">USD — $</option>
                <option value="EUR">EUR — €</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ORDER SETTINGS */}
      <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
            <ShoppingBag size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              Order Settings
            </h3>
            <p className="text-xs text-slate-500">
              Control how customers and staff can place orders.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* QR */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <QrCode size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  QR Self Ordering
                </p>
                <p className="text-xs text-slate-500">
                  Allow customers to order using table QR codes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAllowQrOrder(!allowQrOrder)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                allowQrOrder
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  allowQrOrder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* WAITER */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-violet-200 hover:bg-violet-50/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Waiter Ordering
                </p>
                <p className="text-xs text-slate-500">
                  Allow waiters to create orders for customers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setAllowWaiterOrder(!allowWaiterOrder)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                allowWaiterOrder
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  allowWaiterOrder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* AUTO ACCEPT */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600">
                <Zap size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Auto Accept Orders
                </p>
                <p className="text-xs text-slate-500">
                  Automatically accept new incoming orders.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setAutoAcceptOrder(!autoAcceptOrder)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                autoAcceptOrder
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  autoAcceptOrder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM SAVE */}
      <div className="flex justify-end pb-3">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Save size={17} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
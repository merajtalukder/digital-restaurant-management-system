import { useState } from "react";

const Settings = () => {
  const [restaurantName, setRestaurantName] =
    useState("Restaurant POS");

  const [phone, setPhone] =
    useState("01700000000");

  const [address, setAddress] =
    useState("Uttara, Dhaka");

  const [tax, setTax] = useState("5");

  const [serviceCharge, setServiceCharge] =
    useState("0");

  const [currency, setCurrency] =
    useState("BDT");

  const [allowQrOrder, setAllowQrOrder] =
    useState(true);

  const [allowWaiterOrder, setAllowWaiterOrder] =
    useState(true);

  const [autoAcceptOrder, setAutoAcceptOrder] =
    useState(false);

  const [saved, setSaved] = useState(false);

  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Settings
        </h2>

        <p className="mt-2 text-gray-600">
          Manage restaurant and system settings
        </p>
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}

      {saved && (
        <div className="mb-6 rounded-lg bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          Settings saved successfully.
        </div>
      )}

      {/* ================= RESTAURANT INFORMATION ================= */}

      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Restaurant Information
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Update your restaurant's basic information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Restaurant Name */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Restaurant Name
            </label>

            <input
              type="text"
              value={restaurantName}
              onChange={(e) =>
                setRestaurantName(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          {/* Phone */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          {/* Address */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      {/* ================= BILLING SETTINGS ================= */}

      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Billing Settings
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Configure tax, service charge and currency.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Tax */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tax (%)
            </label>

            <input
              type="number"
              min="0"
              value={tax}
              onChange={(e) =>
                setTax(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          {/* Service Charge */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Service Charge (%)
            </label>

            <input
              type="number"
              min="0"
              value={serviceCharge}
              onChange={(e) =>
                setServiceCharge(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          {/* Currency */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency
            </label>

            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= ORDER SETTINGS ================= */}

      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Order Settings
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Control how customers and staff can place orders.
          </p>
        </div>

        <div className="space-y-5">
          {/* QR */}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-800">
                QR Self Ordering
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Allow customers to place orders using table QR codes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAllowQrOrder(!allowQrOrder)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                allowQrOrder
                  ? "bg-gray-900"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  allowQrOrder
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Waiter */}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-800">
                Waiter Ordering
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Allow waiters to create orders for customers.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAllowWaiterOrder(
                  !allowWaiterOrder
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                allowWaiterOrder
                  ? "bg-gray-900"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  allowWaiterOrder
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Auto Accept */}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-800">
                Auto Accept Orders
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Automatically accept new incoming orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAutoAcceptOrder(
                  !autoAcceptOrder
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                autoAcceptOrder
                  ? "bg-gray-900"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  autoAcceptOrder
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ================= SAVE ================= */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
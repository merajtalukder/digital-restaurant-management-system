import {
  AlertCircle,
  CheckCircle2,
  
  Clock3,
  CreditCard,
  Edit3,
  Eye,
  Info,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Utensils,
  XCircle,
} from "lucide-react";

const order = {
  order: "ORD-1024",
  table: "T-09",
  items: 3,
  amount: "৳850",
  status: "PREPARING",
};

const food = {
  name: "Classic Chicken Burger",
  category: "Burger",
  price: "৳250",
  status: "Available",
};

const menuItems = [
  {
    name: "Classic Chicken Burger",
    category: "Burger",
    price: "৳250",
    status: "Available",
  },
  {
    name: "Chicken Pizza",
    category: "Pizza",
    price: "৳450",
    status: "Available",
  },
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          {number}
        </span>

        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      {status}
    </span>
  );
}

export default function UIShowcase() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">Restaurant POS UI Showcase</h1>

          <p className="mt-1 text-sm text-slate-500">
            With CSS and Without CSS
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ========================================================= */}
        {/* 01 TYPOGRAPHY */}
        {/* ========================================================= */}

        <Section number="01" title="Typography">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <h1 className="text-3xl font-bold text-slate-900">
                  Heading One
                </h1>

                <h2 className="mt-3 text-2xl font-bold">
                  Heading Two
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  This is a paragraph with styling.
                </p>

                <p className="mt-3 text-xl font-bold text-emerald-600">
                  ৳1,250
                </p>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <h1>Heading One</h1>

                <h2>Heading Two</h2>

                <p>This is a paragraph without CSS.</p>

                <p>৳1,250</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 02 BUTTONS */}
        {/* ========================================================= */}

        <Section number="02" title="Buttons">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-xl bg-emerald-600 px-5 py-3 text-white">
                    Primary
                  </button>

                  <button className="rounded-xl border px-5 py-3">
                    Secondary
                  </button>

                  <button className="rounded-xl bg-red-600 px-5 py-3 text-white">
                    Delete
                  </button>

                  <button className="rounded-xl bg-slate-900 px-5 py-3 text-white">
                    Dark
                  </button>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <button>Primary</button>
                <button>Secondary</button>
                <button>Delete</button>
                <button>Dark</button>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 03 INPUT / FORM */}
        {/* ========================================================= */}

        <Section number="03" title="Form Elements">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <label className="mb-2 block text-sm font-semibold">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-xl border px-4 py-3"
                />

                <label className="mb-2 mt-5 block text-sm font-semibold">
                  Category
                </label>

                <select className="w-full rounded-xl border px-4 py-3">
                  <option>Select Category</option>
                  <option>Burger</option>
                  <option>Pizza</option>
                </select>

                <label className="mb-2 mt-5 block text-sm font-semibold">
                  Notes
                </label>

                <textarea
                  placeholder="Add notes..."
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <label>Name</label>
                <br />

                <input
                  type="text"
                  placeholder="Enter your name"
                />

                <br />
                <br />

                <label>Category</label>
                <br />

                <select>
                  <option>Select Category</option>
                  <option>Burger</option>
                  <option>Pizza</option>
                </select>

                <br />
                <br />

                <label>Notes</label>
                <br />

                <textarea placeholder="Add notes..." />
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 04 SEARCH */}
        {/* ========================================================= */}

        <Section number="04" title="Search">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    placeholder="Search orders..."
                    className="w-full rounded-xl border py-3 pl-10 pr-4"
                  />
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <Search size={18} />

                <input placeholder="Search orders..." />
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 05 ORDER CARD */}
        {/* ========================================================= */}

        <Section number="05" title="Order Card">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{order.order}</h3>

                  <StatusBadge status={order.status} />
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Table: {order.table}
                </p>

                <p className="text-sm text-slate-500">
                  Items: {order.items}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <strong>{order.amount}</strong>

                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">
                    View Order
                  </button>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <h3>{order.order}</h3>

                <p>Table: {order.table}</p>

                <p>Items: {order.items}</p>

                <p>Amount: {order.amount}</p>

                <p>Status: {order.status}</p>

                <button>View Order</button>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 06 FOOD CARD */}
        {/* ========================================================= */}

        <Section number="06" title="Food Card">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-400">
                  {food.category}
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  {food.name}
                </h3>

                <div className="mt-3">
                  <StatusBadge status={food.status} />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <strong className="text-lg text-emerald-600">
                    {food.price}
                  </strong>

                  <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <p>{food.category}</p>

                <h3>{food.name}</h3>

                <p>{food.status}</p>

                <p>{food.price}</p>

                <button>Add to Cart</button>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 07 STAT CARD */}
        {/* ========================================================= */}

        <Section number="07" title="Dashboard Stat Card">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                    <ShoppingBag size={20} />
                  </div>

                  <span className="text-xs text-emerald-600">
                    +12%
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Total Orders
                </p>

                <h3 className="text-2xl font-bold">128</h3>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <ShoppingBag size={20} />

                <p>Total Orders</p>

                <h3>128</h3>

                <p>+12%</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 08 STATUS */}
        {/* ========================================================= */}

        <Section number="08" title="Status">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="PENDING" />
                  <StatusBadge status="PREPARING" />
                  <StatusBadge status="READY" />
                  <StatusBadge status="PAID" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge status="CANCELLED" />
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <span>PENDING</span>
                <span>PREPARING</span>
                <span>READY</span>
                <span>PAID</span>
                <span>COMPLETED</span>
                <span>CANCELLED</span>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 09 TABLE */}
        {/* ========================================================= */}

        <Section number="09" title="Table">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="overflow-hidden rounded-2xl border bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4">Order</th>
                      <th className="p-4">Table</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t">
                      <td className="p-4">{order.order}</td>
                      <td className="p-4">{order.table}</td>
                      <td className="p-4">{order.amount}</td>
                      <td className="p-4">{order.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Table</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{order.order}</td>
                    <td>{order.table}</td>
                    <td>{order.amount}</td>
                    <td>{order.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 10 ALERT */}
        {/* ========================================================= */}

        <Section number="10" title="Alerts">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="text-emerald-600" />

                  <div>
                    <strong>Success</strong>
                    <p className="text-sm">
                      Order placed successfully.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <XCircle className="text-red-600" />

                  <div>
                    <strong>Error</strong>
                    <p className="text-sm">
                      Payment failed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="text-amber-600" />

                  <div>
                    <strong>Warning</strong>
                    <p className="text-sm">
                      Payment is pending.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <Info className="text-blue-600" />

                  <div>
                    <strong>Information</strong>
                    <p className="text-sm">
                      Kitchen is processing the order.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <p>
                  <CheckCircle2 /> Success
                </p>

                <p>Order placed successfully.</p>

                <p>
                  <XCircle /> Error
                </p>

                <p>Payment failed.</p>

                <p>
                  <AlertCircle /> Warning
                </p>

                <p>Payment is pending.</p>

                <p>
                  <Info /> Information
                </p>

                <p>Kitchen is processing the order.</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 11 QUANTITY */}
        {/* ========================================================= */}

        <Section number="11" title="Quantity Selector">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border bg-white">
                <button className="flex h-11 w-11 items-center justify-center">
                  <Minus size={16} />
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x">
                  2
                </span>

                <button className="flex h-11 w-11 items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <button>
                  <Minus size={16} />
                </button>

                <span>2</span>

                <button>
                  <Plus size={16} />
                </button>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 12 ORDER SUMMARY */}
        {/* ========================================================= */}

        <Section number="12" title="Order Summary">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">
                  Order #{order.order}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Table {order.table}
                </p>

                <hr className="my-5" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Chicken Burger × 2</span>
                    <span>৳500</span>
                  </div>

                  <div className="flex justify-between">
                    <span>French Fries × 1</span>
                    <span>৳150</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Coke × 2</span>
                    <span>৳100</span>
                  </div>
                </div>

                <hr className="my-5" />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳750</span>
                </div>

                <div className="mt-2 flex justify-between">
                  <span>VAT 5%</span>
                  <span>৳37.50</span>
                </div>

                <div className="mt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>৳787.50</span>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <h3>Order #{order.order}</h3>

                <p>Table {order.table}</p>

                <hr />

                <p>Chicken Burger × 2 — ৳500</p>
                <p>French Fries × 1 — ৳150</p>
                <p>Coke × 2 — ৳100</p>

                <hr />

                <p>Subtotal: ৳750</p>
                <p>VAT 5%: ৳37.50</p>
                <p>Total: ৳787.50</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 13 MENU LIST */}
        {/* ========================================================= */}

        <Section number="13" title="Menu List">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border bg-white p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-slate-500">
                        {item.category}
                      </p>
                    </div>

                    <strong>{item.price}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                {menuItems.map((item) => (
                  <div key={item.name}>
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                    <p>{item.price}</p>
                    <hr />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 14 TABLE STATUS */}
        {/* ========================================================= */}

        <Section number="14" title="Table Status">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-5">
                  <Utensils size={20} />

                  <h3 className="mt-3 font-bold">Table T-01</h3>

                  <span className="text-sm text-emerald-600">
                    AVAILABLE
                  </span>
                </div>

                <div className="rounded-xl border bg-white p-5">
                  <Utensils size={20} />

                  <h3 className="mt-3 font-bold">Table T-02</h3>

                  <span className="text-sm text-red-600">
                    OCCUPIED
                  </span>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <div>
                  <Utensils size={20} />

                  <h3>Table T-01</h3>

                  <p>AVAILABLE</p>
                </div>

                <div>
                  <Utensils size={20} />

                  <h3>Table T-02</h3>

                  <p>OCCUPIED</p>
                </div>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 15 NAVIGATION */}
        {/* ========================================================= */}

        <Section number="15" title="Navigation">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <strong>Restaurant POS</strong>

                  <div className="flex gap-5 text-sm">
                    <span>Dashboard</span>
                    <span>Orders</span>
                    <span>Tables</span>
                    <span>Profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <nav>
                <strong>Restaurant POS</strong>

                <a href="#">Dashboard</a>
                <a href="#">Orders</a>
                <a href="#">Tables</a>
                <a href="#">Profile</a>
              </nav>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 16 PAYMENT */}
        {/* ========================================================= */}

        <Section number="16" title="Payment Card">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-3">
                    <CreditCard className="text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Payment #PAY-1024
                    </h3>

                    <p className="text-sm text-slate-500">
                      Order #{order.order}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex justify-between">
                  <span>Amount</span>
                  <strong>৳850</strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span>Method</span>
                  <span>CASH</span>
                </div>

                <div className="mt-2 flex justify-between">
                  <span>Status</span>
                  <span className="text-emerald-600">PAID</span>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <CreditCard />

                <h3>Payment #PAY-1024</h3>

                <p>Order #{order.order}</p>

                <p>Amount: ৳850</p>

                <p>Method: CASH</p>

                <p>Status: PAID</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 17 LOADING */}
        {/* ========================================================= */}

        <Section number="17" title="Loading">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="flex items-center gap-3 rounded-xl border bg-white p-5">
                <Loader2
                  size={22}
                  className="animate-spin text-emerald-600"
                />

                <span>Loading...</span>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <Loader2 size={22} />
                <span>Loading...</span>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 18 MODAL */}
        {/* ========================================================= */}

        <Section number="18" title="Confirmation Modal">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Delete Menu Item?
                  </h3>

                  <XCircle className="text-slate-400" />
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Are you sure you want to delete this item?
                </p>

                <div className="mt-5 flex gap-3">
                  <button className="rounded-xl border px-5 py-3">
                    Cancel
                  </button>

                  <button className="rounded-xl bg-red-600 px-5 py-3 text-white">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <h3>Delete Menu Item?</h3>

                <p>Are you sure you want to delete this item?</p>

                <button>Cancel</button>

                <button>Delete</button>
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 19 ICONS */}
        {/* ========================================================= */}

        <Section number="19" title="Icons">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="flex flex-wrap gap-4 rounded-2xl border bg-white p-6">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Utensils />
                </div>

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <ShoppingBag />
                </div>

                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <CreditCard />
                </div>

                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <Clock3 />
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Search />
                </div>

                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <Trash2 />
                </div>

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Eye />
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Edit3 />
                </div>
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <Utensils />
                <ShoppingBag />
                <CreditCard />
                <Clock3 />
                <Search />
                <Trash2 />
                <Eye />
                <Edit3 />
              </div>
            </div>

          </div>
        </Section>

        {/* ========================================================= */}
        {/* 20 CUSTOMER CUSTOMIZATION */}
        {/* ========================================================= */}

        <Section number="20" title="Customer Order Customization">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* WITH CSS */}
            <div>
              <h3 className="mb-3 font-bold">With CSS</h3>

              <div className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">
                  Customize Your Order
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add special instructions for the kitchen.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="flex items-center justify-between rounded-xl border p-4">
                    <span>Less spicy</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border p-4">
                    <span>Less oil</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border p-4">
                    <span>No onion</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border p-4">
                    <span>Extra sauce</span>
                    <input type="checkbox" />
                  </label>
                </div>

                <textarea
                  className="mt-4 w-full rounded-xl border p-3"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* WITHOUT CSS */}
            <div>
              <h3 className="mb-3 font-bold">Without CSS</h3>

              <div>
                <h3>Customize Your Order</h3>

                <p>Add special instructions for the kitchen.</p>

                <label>
                  <input type="checkbox" />
                  Less spicy
                </label>

                <br />

                <label>
                  <input type="checkbox" />
                  Less oil
                </label>

                <br />

                <label>
                  <input type="checkbox" />
                  No onion
                </label>

                <br />

                <label>
                  <input type="checkbox" />
                  Extra sauce
                </label>

                <br />
                <br />

                <textarea placeholder="Additional notes..." />
              </div>
            </div>

          </div>
        </Section>

      </main>
    </div>
  );
}
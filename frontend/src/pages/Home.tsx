import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  ClipboardList,
  CreditCard,
  QrCode,
  ShoppingCart,
  Sparkles,
  Table2,
  Users,
  Utensils,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const pages = ["Home", "About", "Features", "How It Works"];

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-100 p-2 sm:p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl">

        {/* NAVBAR */}
        <nav className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-7 sm:py-5 md:px-10">
          <button
            type="button"
            onClick={() => setCurrentPage(0)}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Utensils size={19} />
            </div>

            <span className="text-base font-bold text-slate-900 sm:text-lg">
              Restaurant POS
            </span>
          </button>

          <div className="hidden items-center gap-6 md:flex">
            {pages.map((page, index) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(index)}
                className={`text-sm font-semibold transition ${
                  currentPage === index
                    ? "text-emerald-600"
                    : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
            >
              Login
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white md:hidden"
          >
            Login
          </button>
        </nav>

        {/* CONTENT */}
        <main className="h-full overflow-hidden">

          {/* HOME */}
          {currentPage === 0 && (
            <section className="flex h-full items-center px-5 pt-16 sm:px-8 md:px-14 md:pt-12">
              <div className="grid w-full items-center gap-8 md:grid-cols-2 md:gap-10">

                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Sparkles size={14} />
                    Smart Restaurant Management
                  </div>

                  <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                    Run Your Restaurant
                    <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                      Smarter & Faster
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base md:text-lg md:leading-7">
                    A complete restaurant management system for tables,
                    menus, orders, kitchen operations, billing and customer
                    QR ordering — all in one place.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                    >
                      Get Started
                      <ChevronRight size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(2)}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Explore Features
                    </button>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Easy to use
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      QR Ordering
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Real-time Orders
                    </span>
                  </div>
                </div>

                {/* VISUAL */}
                <div className="hidden justify-center md:flex">
                  <div className="relative flex h-[390px] w-[390px] items-center justify-center rounded-[45px] bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50">

                    <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100" />
                    <div className="absolute h-56 w-56 rounded-full bg-white shadow-lg" />

                    <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
                      <Utensils size={58} strokeWidth={1.5} />
                    </div>

                    {/* TABLE */}
                    <div className="absolute left-3 top-14 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Table2 size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Tables</p>
                          <p className="font-bold text-slate-800">24</p>
                        </div>
                      </div>
                    </div>

                    {/* ORDERS */}
                    <div className="absolute bottom-14 right-3 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Orders</p>
                          <p className="font-bold text-slate-800">128</p>
                        </div>
                      </div>
                    </div>

                    {/* QR */}
                    <div className="absolute right-4 top-20 rounded-xl bg-white p-2.5 text-cyan-600 shadow-md">
                      <QrCode size={25} />
                    </div>

                    {/* KITCHEN */}
                    <div className="absolute bottom-20 left-5 rounded-xl bg-white p-2.5 text-violet-600 shadow-md">
                      <ChefHat size={25} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ABOUT */}
          {currentPage === 1 && (
            <section className="flex h-full items-center justify-center px-5 pt-16 sm:px-8 md:px-16">
              <div className="w-full max-w-5xl text-center">
                <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 text-emerald-600">
                  <Utensils size={26} />
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  About the System
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
                  Everything Your Restaurant Needs
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Restaurant POS connects staff, tables, menus, orders,
                  kitchen operations, payments and customers in one
                  centralized platform.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <InfoCard
                    icon={<Users size={25} />}
                    title="Staff Management"
                    text="Manage admin, manager, waiter and kitchen staff efficiently."
                    color="violet"
                  />

                  <InfoCard
                    icon={<Table2 size={25} />}
                    title="Table Management"
                    text="Track table availability, occupancy and restaurant flow."
                    color="emerald"
                  />

                  <InfoCard
                    icon={<ClipboardList size={25} />}
                    title="Order Management"
                    text="Handle waiter and customer QR orders from one place."
                    color="cyan"
                  />
                </div>
              </div>
            </section>
          )}

          {/* FEATURES */}
          {currentPage === 2 && (
            <section className="flex h-full items-center justify-center px-5 pt-16 sm:px-8 md:px-14">
              <div className="w-full max-w-5xl">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Features
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
                    Powerful Tools for Your Restaurant
                  </h2>

                  <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
                    Everything you need to manage daily restaurant
                    operations smoothly and efficiently.
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <FeatureCard
                    icon={<Table2 size={23} />}
                    title="Tables"
                    text="Manage tables and occupancy."
                    color="emerald"
                  />

                  <FeatureCard
                    icon={<ClipboardList size={23} />}
                    title="Orders"
                    text="Create and track orders."
                    color="violet"
                  />

                  <FeatureCard
                    icon={<ChefHat size={23} />}
                    title="Kitchen"
                    text="Manage kitchen workflow."
                    color="cyan"
                  />

                  <FeatureCard
                    icon={<ShoppingCart size={23} />}
                    title="Menu"
                    text="Manage food and categories."
                    color="fuchsia"
                  />

                  <FeatureCard
                    icon={<QrCode size={23} />}
                    title="QR Ordering"
                    text="Let customers order digitally."
                    color="cyan"
                  />

                  <FeatureCard
                    icon={<CreditCard size={23} />}
                    title="Payments"
                    text="Handle restaurant billing."
                    color="emerald"
                  />

                  <FeatureCard
                    icon={<BarChart3 size={23} />}
                    title="Reports"
                    text="Monitor business performance."
                    color="violet"
                  />

                  <FeatureCard
                    icon={<Users size={23} />}
                    title="Staff"
                    text="Manage restaurant staff."
                    color="fuchsia"
                  />
                </div>
              </div>
            </section>
          )}

          {/* HOW IT WORKS */}
          {currentPage === 3 && (
            <section className="flex h-full items-center justify-center px-5 pt-16 sm:px-8 md:px-14">
              <div className="w-full max-w-5xl">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    How It Works
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
                    Two Simple Ways to Place an Order
                  </h2>

                  <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
                    Support both traditional waiter ordering and modern
                    QR-based self-ordering.
                  </p>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <FlowCard
                    icon={<Users size={24} />}
                    title="Waiter-Based Ordering"
                    subtitle="Traditional restaurant ordering"
                    color="emerald"
                    steps={[
                      ["01", "Customer Sits", "Customer chooses a table and views the menu."],
                      ["02", "Waiter Takes Order", "Waiter selects the table and adds customer items."],
                      ["03", "Kitchen Receives", "The order is sent directly to the kitchen."],
                      ["04", "Food Is Served", "Kitchen prepares the food and waiter serves it."],
                    ]}
                  />

                  <FlowCard
                    icon={<QrCode size={24} />}
                    title="QR Code Self-Ordering"
                    subtitle="Fast and contactless ordering"
                    color="violet"
                    steps={[
                      ["01", "Scan Table QR", "Customer scans the QR code on the table."],
                      ["02", "Browse Menu", "Customer opens the digital menu and selects items."],
                      ["03", "Place Order", "Customer adds items and confirms the order."],
                      ["04", "Kitchen Receives", "The order goes directly to the kitchen."],
                    ]}
                  />
                </div>
              </div>
            </section>
          )}
        </main>

        {/* PAGE DOTS */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center sm:bottom-5">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to page ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentPage === index
                    ? "w-6 bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* INFO CARD */

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: "emerald" | "violet" | "cyan";
};

const InfoCard = ({ icon, title, text, color }: InfoCardProps) => {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${styles[color]}`}
      >
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-slate-800">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
};

/* FEATURE CARD */

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: "emerald" | "violet" | "cyan" | "fuchsia";
};

const FeatureCard = ({
  icon,
  title,
  text,
  color,
}: FeatureCardProps) => {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    cyan: "bg-cyan-50 text-cyan-600",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}
      >
        {icon}
      </div>

      <h3 className="mt-2.5 text-sm font-bold text-slate-800">{title}</h3>

      <p className="mt-1 text-[11px] leading-4 text-slate-500">{text}</p>
    </div>
  );
};

/* FLOW CARD */

type FlowCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: "emerald" | "violet";
  steps: [string, string, string][];
};

const FlowCard = ({
  icon,
  title,
  subtitle,
  color,
  steps,
}: FlowCardProps) => {
  const iconStyle =
    color === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-violet-50 text-violet-600";

  const numberStyle =
    color === "emerald"
      ? "bg-emerald-600"
      : "bg-violet-600";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {steps.map(([number, stepTitle, text]) => (
          <div key={number} className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${numberStyle}`}
            >
              {number}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                {stepTitle}
              </h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
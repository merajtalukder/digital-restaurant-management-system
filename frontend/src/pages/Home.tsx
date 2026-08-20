import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  CreditCard,
  QrCode,
  ShoppingCart,
  Table2,
  Users,
  Utensils,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-100 p-4 md:p-6">

      {/* ================= MAIN CARD ================= */}

      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-xl">

        {/* ================= NAVBAR ================= */}

        <nav className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-8 py-6 md:px-12">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => setCurrentPage(0)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Utensils size={20} />
            </div>

            <span className="text-lg font-bold text-slate-900">
              Restaurant POS
            </span>
          </button>


          {/* NAVIGATION */}

          <div className="hidden items-center gap-8 md:flex">

            <NavButton
              active={currentPage === 0}
              onClick={() => setCurrentPage(0)}
            >
              Home
            </NavButton>

            <NavButton
              active={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              About
            </NavButton>

            <NavButton
              active={currentPage === 2}
              onClick={() => setCurrentPage(2)}
            >
              Features
            </NavButton>

            <NavButton
              active={currentPage === 3}
              onClick={() => setCurrentPage(3)}
            >
              How It Works
            </NavButton>

            {/* LOGIN */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </button>

          </div>

        </nav>


        {/* ================= CONTENT ================= */}

        <main className="h-full overflow-hidden">

          {/* ================================================= */}
          {/* PAGE 1 — HOME */}
          {/* ================================================= */}

          {currentPage === 0 && (

            <section className="flex h-full items-center px-8 pt-20 md:px-16">

              <div className="grid w-full items-center gap-12 md:grid-cols-2">

                {/* LEFT */}

                <div>

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">

                    <CheckCircle2 size={16} />

                    Smart Restaurant Management

                  </div>


                  <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">

                    Manage Your Restaurant

                    <span className="block text-blue-600">
                      Smarter & Faster
                    </span>

                  </h1>


                  <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 md:text-lg">

                    A complete restaurant management system for handling
                    tables, menus, orders, kitchen operations, billing and
                    customer QR ordering from one place.

                  </p>

                </div>


                {/* RIGHT */}

                <div className="hidden justify-center md:flex">

                  <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-[40px] bg-blue-50">

                    <div className="absolute h-72 w-72 rounded-full bg-blue-100" />

                    <div className="absolute h-56 w-56 rounded-full bg-white shadow-lg" />

                    {/* CENTER */}

                    <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl">

                      <Utensils
                        size={65}
                        strokeWidth={1.5}
                      />

                    </div>


                    {/* TABLE CARD */}

                    <div className="absolute left-5 top-16 rounded-2xl bg-white px-4 py-3 shadow-lg">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Table2 size={18} />
                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Tables
                          </p>

                          <p className="font-bold text-slate-800">
                            24
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* ORDERS CARD */}

                    <div className="absolute bottom-16 right-5 rounded-2xl bg-white px-4 py-3 shadow-lg">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <ClipboardList size={18} />
                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Orders
                          </p>

                          <p className="font-bold text-slate-800">
                            128
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </section>

          )}


          {/* ================================================= */}
          {/* PAGE 2 — ABOUT */}
          {/* ================================================= */}

          {currentPage === 1 && (

            <section className="flex h-full items-center justify-center px-8 pt-20 md:px-20">

              <div className="w-full max-w-5xl text-center">

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Utensils size={27} />
                </div>

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  About the System
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">
                  Everything Your Restaurant Needs
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500">

                  Restaurant POS is designed to simplify daily restaurant
                  operations by connecting staff, tables, orders, kitchen
                  operations and customers in one centralized system.

                </p>


                <div className="mt-10 grid gap-5 md:grid-cols-3">

                  <InfoCard
                    icon={<Users size={27} />}
                    title="Staff Management"
                    text="Manage admin and waiter access efficiently."
                  />

                  <InfoCard
                    icon={<Table2 size={27} />}
                    title="Table Management"
                    text="Track table availability and occupancy."
                  />

                  <InfoCard
                    icon={<ClipboardList size={27} />}
                    title="Order Management"
                    text="Handle restaurant orders from one place."
                  />

                </div>

              </div>

            </section>

          )}


          {/* ================================================= */}
          {/* PAGE 3 — FEATURES */}
          {/* ================================================= */}

          {currentPage === 2 && (

            <section className="flex h-full items-center justify-center px-8 pt-20 md:px-16">

              <div className="w-full max-w-5xl">

                <div className="text-center">

                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Features
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">
                    Powerful Tools for Your Restaurant
                  </h2>

                  <p className="mx-auto mt-4 max-w-2xl text-slate-500">

                    Everything you need to manage restaurant operations
                    smoothly and efficiently.

                  </p>

                </div>


                <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">

                  <FeatureCard
                    icon={<Table2 size={25} />}
                    title="Tables"
                    text="Manage tables and occupancy."
                  />

                  <FeatureCard
                    icon={<ClipboardList size={25} />}
                    title="Orders"
                    text="Create and track orders."
                  />

                  <FeatureCard
                    icon={<ChefHat size={25} />}
                    title="Kitchen"
                    text="Manage kitchen workflow."
                  />

                  <FeatureCard
                    icon={<ShoppingCart size={25} />}
                    title="Menu"
                    text="Manage food and categories."
                  />

                  <FeatureCard
                    icon={<QrCode size={25} />}
                    title="QR Ordering"
                    text="Let customers order digitally."
                  />

                  <FeatureCard
                    icon={<CreditCard size={25} />}
                    title="Payments"
                    text="Handle restaurant billing."
                  />

                  <FeatureCard
                    icon={<BarChart3 size={25} />}
                    title="Reports"
                    text="Monitor business performance."
                  />

                  <FeatureCard
                    icon={<Users size={25} />}
                    title="Staff"
                    text="Manage restaurant staff."
                  />

                </div>

              </div>

            </section>

          )}


          {/* ================================================= */}
          {/* PAGE 4 — HOW IT WORKS */}
          {/* ================================================= */}

          {currentPage === 3 && (

            <section className="flex h-full items-center justify-center px-8 pt-20 md:px-16">

              <div className="w-full max-w-5xl">

                <div className="text-center">

                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    How It Works
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">
                    Two Simple Ways to Place an Order
                  </h2>

                  <p className="mx-auto mt-4 max-w-2xl text-slate-500">

                    Our restaurant system supports both waiter-based ordering
                    and QR code self-ordering.

                  </p>

                </div>


                {/* TWO FLOWS */}

                <div className="mt-8 grid gap-6 md:grid-cols-2">

                  {/* WAITER FLOW */}

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Users size={25} />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-slate-900">
                          Waiter-Based Ordering
                        </h3>

                        <p className="text-sm text-slate-500">
                          Traditional restaurant ordering
                        </p>

                      </div>

                    </div>


                    <div className="mt-6 space-y-4">

                      <FlowStep
                        number="01"
                        title="Customer Sits"
                        text="Customer chooses a table and views the menu."
                      />

                      <FlowStep
                        number="02"
                        title="Waiter Takes Order"
                        text="Waiter selects the table and adds the customer's items."
                      />

                      <FlowStep
                        number="03"
                        title="Kitchen Receives Order"
                        text="The order is sent directly to the kitchen."
                      />

                      <FlowStep
                        number="04"
                        title="Food Is Served"
                        text="Kitchen prepares the food and waiter serves it."
                      />

                    </div>

                  </div>


                  {/* QR FLOW */}

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <QrCode size={25} />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-slate-900">
                          QR Code Self-Ordering
                        </h3>

                        <p className="text-sm text-slate-500">
                          Fast and contactless ordering
                        </p>

                      </div>

                    </div>


                    <div className="mt-6 space-y-4">

                      <FlowStep
                        number="01"
                        title="Scan Table QR"
                        text="Customer scans the QR code placed on the table."
                      />

                      <FlowStep
                        number="02"
                        title="Browse Menu"
                        text="Customer opens the digital menu and selects items."
                      />

                      <FlowStep
                        number="03"
                        title="Place Order"
                        text="Customer adds items to cart and confirms the order."
                      />

                      <FlowStep
                        number="04"
                        title="Kitchen Receives"
                        text="The order goes directly to the restaurant kitchen."
                      />

                    </div>

                  </div>

                </div>

              </div>

            </section>

          )}

        </main>


        {/* ================= PAGE DOTS ================= */}

        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center">

          <div className="flex items-center gap-2">

            {[0, 1, 2, 3].map((index) => (

              <button
                key={index}
                type="button"
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to page ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentPage === index
                    ? "w-6 bg-blue-600"
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


/* ================================================= */
/* NAV BUTTON */
/* ================================================= */

type NavButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const NavButton = ({
  active,
  onClick,
  children,
}: NavButtonProps) => {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium transition ${
        active
          ? "text-blue-600"
          : "text-slate-500 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
};


/* ================================================= */
/* INFO CARD */
/* ================================================= */

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
};

const InfoCard = ({
  icon,
  title,
  text,
}: InfoCardProps) => {

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
};


/* ================================================= */
/* FEATURE CARD */
/* ================================================= */

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
};

const FeatureCard = ({
  icon,
  title,
  text,
}: FeatureCardProps) => {

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-1 hover:shadow-md">

      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
};


/* ================================================= */
/* FLOW STEP */
/* ================================================= */

type FlowStepProps = {
  number: string;
  title: string;
  text: string;
};

const FlowStep = ({
  number,
  title,
  text,
}: FlowStepProps) => {

  return (
    <div className="flex items-start gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </div>

      <div>

        <h4 className="font-semibold text-slate-800">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
};


export default Home;
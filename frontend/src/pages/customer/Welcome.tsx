import { Utensils, Sparkles } from "lucide-react";

const Welcome = () => {
  return (
    <div className="h-full overflow-hidden bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-sm">

        {/* Header */}
        <div className="shrink-0 px-5 pt-4 sm:px-6 sm:pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 sm:text-xs">
            Restaurant
          </p>

          <h1 className="mt-0.5 text-lg font-bold text-slate-900 sm:text-xl">
            Restaurant POS
          </h1>
        </div>

        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">

          {/* Illustration */}
          <div className="relative mb-5 flex h-44 w-44 items-center justify-center rounded-full bg-emerald-50 sm:h-52 sm:w-52">

            <div className="absolute h-36 w-36 rounded-full bg-teal-100 sm:h-44 sm:w-44" />

            <div className="absolute right-5 top-5 text-violet-400">
              <Sparkles size={20} />
            </div>

            <div className="absolute bottom-7 left-5 h-3 w-3 rounded-full bg-cyan-400" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg sm:h-32 sm:w-32">
              <div
                className="
                  flex h-20 w-20 items-center justify-center
                  rounded-full
                  bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
                  text-white shadow-md
                  sm:h-24 sm:w-24
                "
              >
                <Utensils
                  size={40}
                  strokeWidth={1.7}
                  className="sm:h-11 sm:w-11"
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <p className="text-xs font-semibold text-emerald-500 sm:text-sm">
            Fresh • Delicious • Simple
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Good Food,
            <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Good Mood.
            </span>
          </h2>

          <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Explore our menu, choose your favorite food and place your order
            directly from your table.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Welcome;
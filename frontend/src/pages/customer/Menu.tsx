import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Utensils,
  Flame,
  Coffee,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  X,
  Plus,
  Minus,
  MessageSquareText,
} from "lucide-react";

import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  image?: string;
  foodType?: string;
  preparationType?: string;
  categoryId?: number;
  available?: boolean;
  isAvailable?: boolean;
}

type FoodType = "INSTANT" | "HAVE_TO_COOK";

type CustomizationOption = "LESS" | "NORMAL" | "MORE";

interface CustomizationState {
  spicy: CustomizationOption;
  sour: CustomizationOption;
  noOnion: boolean;
  noGarlic: boolean;
  extraCheese: boolean;
  otherInstructions: string;
}

const defaultCustomization: CustomizationState = {
  spicy: "NORMAL",
  sour: "NORMAL",
  noOnion: false,
  noGarlic: false,
  extraCheese: false,
  otherInstructions: "",
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFoodType, setSelectedFoodType] =
    useState<FoodType | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [customizingItem, setCustomizingItem] =
    useState<MenuItem | null>(null);

  const [customization, setCustomization] =
    useState<CustomizationState>({
      ...defaultCustomization,
    });

  const [quantity, setQuantity] = useState(1);

  const [searchParams] = useSearchParams();

  // Supports both old QR links (?table=)
  // and new links (?tableId=)
  const tableIdFromUrl =
    searchParams.get("tableId") ||
    searchParams.get("table");

  const { addToCart } = useCart();

  // Save table ID from QR
  useEffect(() => {
    if (tableIdFromUrl) {
      localStorage.setItem(
        "customerTableId",
        tableIdFromUrl
      );
    }
  }, [tableIdFromUrl]);

  // Fetch menu and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [menuResponse, categoryResponse] =
          await Promise.all([
            api.get("/menu-items"),
            api.get("/categories"),
          ]);

        console.log(
          "MENU API RESPONSE:",
          menuResponse.data
        );

        console.log(
          "CATEGORY API RESPONSE:",
          categoryResponse.data
        );

        setMenuItems(menuResponse.data);
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error(
          "Failed to load menu data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Normalize food type
  const normalizeFoodType = (value?: string) => {
    if (!value) return "";

    return value
      .toUpperCase()
      .replace(/[\s_-]/g, "");
  };

  // Instant items
  const instantItems = useMemo(() => {
    return menuItems.filter((item) => {
      const type = normalizeFoodType(
        item.foodType || item.preparationType
      );

      return type === "INSTANT";
    });
  }, [menuItems]);

  // Have to cook items
  const cookingItems = useMemo(() => {
    return menuItems.filter((item) => {
      const type = normalizeFoodType(
        item.foodType || item.preparationType
      );

      return (
        type === "COOKED" ||
        type === "HAVETOCOOK"
      );
    });
  }, [menuItems]);

  // Get categories according to items
  const getCategoriesForItems = (
    items: MenuItem[]
  ) => {
    const categoryIds = new Set<number>();

    items.forEach((item) => {
      if (item.categoryId) {
        categoryIds.add(item.categoryId);
      }
    });

    return categories.filter((category) =>
      categoryIds.has(category.id)
    );
  };

  const instantCategories = useMemo(() => {
    return getCategoriesForItems(instantItems);
  }, [instantItems, categories]);

  const cookingCategories = useMemo(() => {
    return getCategoriesForItems(cookingItems);
  }, [cookingItems, categories]);

  // Current food type items
  const currentTypeItems = useMemo(() => {
    if (!selectedFoodType) {
      return [];
    }

    return selectedFoodType === "INSTANT"
      ? instantItems
      : cookingItems;
  }, [
    selectedFoodType,
    instantItems,
    cookingItems,
  ]);

  // Current categories
  const currentCategories = useMemo(() => {
    if (!selectedFoodType) {
      return [];
    }

    return selectedFoodType === "INSTANT"
      ? instantCategories
      : cookingCategories;
  }, [
    selectedFoodType,
    instantCategories,
    cookingCategories,
  ]);

  // Items of selected category
  const categoryItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return currentTypeItems.filter(
      (item) =>
        item.categoryId === selectedCategory.id
    );
  }, [
    selectedCategory,
    currentTypeItems,
  ]);

  // Check availability
  const isItemAvailable = (item: MenuItem) => {
    if (
      typeof item.isAvailable === "boolean"
    ) {
      return item.isAvailable;
    }

    if (
      typeof item.available === "boolean"
    ) {
      return item.available;
    }

    return true;
  };

  // Open customization
  const handleOpenCustomization = (
    item: MenuItem
  ) => {
    setCustomizingItem(item);

    setCustomization({
      ...defaultCustomization,
    });

    setQuantity(1);
  };

  // Close customization
  const handleCloseCustomization = () => {
    setCustomizingItem(null);

    setCustomization({
      ...defaultCustomization,
    });

    setQuantity(1);
  };

  // Build readable special instructions
  const buildSpecialInstructions = () => {
    const instructions: string[] = [];

    if (customization.spicy !== "NORMAL") {
      instructions.push(
        `Spicy: ${
          customization.spicy === "LESS"
            ? "Less"
            : "More"
        }`
      );
    }

    if (customization.sour !== "NORMAL") {
      instructions.push(
        `Sour: ${
          customization.sour === "LESS"
            ? "Less"
            : "More"
        }`
      );
    }

    if (customization.noOnion) {
      instructions.push("No Onion");
    }

    if (customization.noGarlic) {
      instructions.push("No Garlic");
    }

    if (customization.extraCheese) {
      instructions.push("Extra Cheese");
    }

    const other =
      customization.otherInstructions.trim();

    if (other) {
      instructions.push(`Note: ${other}`);
    }

    return instructions.join(", ");
  };

  // Add customized item to cart
  const handleConfirmAddToCart = () => {
    if (!customizingItem) {
      return;
    }

    const specialInstructions =
      buildSpecialInstructions();

    addToCart({
      id: customizingItem.id,
      name: customizingItem.name,
      price: Number(customizingItem.price),
      image: customizingItem.image,
      quantity,
      specialInstructions:
        specialInstructions || undefined,
    });

    handleCloseCustomization();
  };

  // Back button
  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    if (selectedFoodType) {
      setSelectedFoodType(null);
    }
  };

  // =========================
  // SMALL FOOD CARD
  // =========================
  const FoodCard = ({
    item,
  }: {
    item: MenuItem;
  }) => {
    const available =
      isItemAvailable(item);

    return (
      <div
        className="
          group
          bg-white
          rounded-2xl
          overflow-hidden
          border
          border-slate-100
          shadow-sm
          hover:shadow-lg
          hover:-translate-y-0.5
          transition-all
          duration-200
        "
      >
        {/* Image */}
        <div
          className="
            relative
            h-32
            sm:h-36
            bg-gradient-to-br
            from-slate-100
            to-slate-50
            overflow-hidden
          "
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="
                w-full
                h-full
                object-cover
                group-hover:scale-105
                transition-transform
                duration-300
              "
            />
          ) : (
            <div
              className="
                w-full
                h-full
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-emerald-50
                via-teal-50
                to-cyan-50
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-white
                  shadow-sm
                  flex
                  items-center
                  justify-center
                "
              >
                <Utensils
                  size={27}
                  className="text-emerald-400"
                />
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="absolute top-2 left-2">
            {available ? (
              <span
                className="
                  bg-white/95
                  backdrop-blur-sm
                  text-emerald-600
                  text-[9px]
                  font-bold
                  px-2
                  py-1
                  rounded-full
                  shadow-sm
                  flex
                  items-center
                  gap-1
                "
              >
                <CheckCircle2 size={11} />
                Available
              </span>
            ) : (
              <span
                className="
                  bg-white/95
                  backdrop-blur-sm
                  text-rose-500
                  text-[9px]
                  font-bold
                  px-2
                  py-1
                  rounded-full
                  shadow-sm
                  flex
                  items-center
                  gap-1
                "
              >
                <XCircle size={11} />
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Food Information */}
        <div className="p-3.5">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="
                  text-sm
                  sm:text-base
                  font-bold
                  text-slate-800
                  truncate
                  group-hover:text-emerald-600
                  transition-colors
                "
              >
                {item.name}
              </h3>

              {item.description && (
                <p
                  className="
                    text-[11px]
                    sm:text-xs
                    text-slate-500
                    mt-1
                    line-clamp-1
                  "
                >
                  {item.description}
                </p>
              )}
            </div>

            <span
              className="
                font-extrabold
                text-emerald-600
                whitespace-nowrap
                text-sm
              "
            >
              ৳{Number(item.price)}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            disabled={!available}
            onClick={() =>
              handleOpenCustomization(item)
            }
            className={`
              w-full
              mt-3
              py-2
              rounded-xl
              text-xs
              sm:text-sm
              font-bold
              flex
              items-center
              justify-center
              gap-1.5
              transition-all
              ${
                available
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-md active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            <ShoppingCart size={15} />

            {available
              ? "Add to Cart"
              : "Not Available"}
          </button>
        </div>
      </div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div
        className="
          min-h-[50vh]
          flex
          flex-col
          items-center
          justify-center
          bg-slate-50
        "
      >
        <div
          className="
            w-10
            h-10
            border-4
            border-emerald-100
            border-t-emerald-500
            rounded-full
            animate-spin
          "
        />

        <p className="mt-3 text-sm text-slate-500 font-medium">
          Loading menu...
        </p>
      </div>
    );
  }

  // No menu
  if (menuItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <div
          className="
            w-16
            h-16
            mx-auto
            rounded-2xl
            bg-emerald-50
            flex
            items-center
            justify-center
          "
        >
          <Utensils
            size={28}
            className="text-emerald-500"
          />
        </div>

        <h2
          className="
            text-xl
            font-bold
            text-slate-800
            mt-4
          "
        >
          No Menu Items
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          No food items are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-4
          pb-24
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            mb-5
            rounded-2xl
            overflow-hidden
            bg-gradient-to-br
            from-emerald-700
            via-teal-600
            to-cyan-600
            p-5
            sm:p-7
            text-white
            shadow-lg
            relative
          "
        >
          {/* Decorative circles */}
          <div
            className="
              absolute
              -top-12
              -right-12
              w-32
              h-32
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              absolute
              -bottom-16
              right-16
              w-40
              h-40
              rounded-full
              bg-cyan-300/10
            "
          />

          <div className="relative">
            <div
              className="
                inline-flex
                items-center
                gap-1.5
                px-2.5
                py-1
                rounded-full
                bg-white/15
                border
                border-white/20
                text-[11px]
                font-semibold
                backdrop-blur-sm
              "
            >
              <Sparkles size={13} />
              DIGITAL MENU
            </div>

            <h1
              className="
                text-2xl
                sm:text-4xl
                font-extrabold
                tracking-tight
                mt-3
              "
            >
              Discover Something Delicious
            </h1>

            <p
              className="
                mt-2
                text-emerald-50
                max-w-2xl
                leading-relaxed
                text-xs
                sm:text-sm
              "
            >
              Explore our carefully selected
              dishes, freshly prepared just for
              you.
            </p>
          </div>
        </div>

        {/* ================= FOOD TYPE ================= */}
        {!selectedFoodType && (
          <div>
            <div className="mb-4">
              <p
                className="
                  text-[11px]
                  font-bold
                  text-emerald-600
                  uppercase
                  tracking-wider
                "
              >
                Explore our menu
              </p>

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-extrabold
                  text-slate-800
                  mt-0.5
                "
              >
                What would you like?
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Choose a food type to get started.
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:gap-5
              "
            >
              {/* INSTANT */}
              <button
                onClick={() =>
                  setSelectedFoodType(
                    "INSTANT"
                  )
                }
                className="
                  group
                  relative
                  overflow-hidden
                  text-left
                  bg-white
                  border
                  border-emerald-100
                  rounded-2xl
                  p-4
                  sm:p-6
                  shadow-sm
                  hover:shadow-lg
                  hover:-translate-y-0.5
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    absolute
                    -right-8
                    -top-8
                    w-24
                    h-24
                    rounded-full
                    bg-emerald-50
                  "
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className="
                        w-11
                        h-11
                        sm:w-14
                        sm:h-14
                        rounded-xl
                        bg-gradient-to-br
                        from-emerald-100
                        to-teal-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Coffee
                        size={23}
                        className="text-emerald-600"
                      />
                    </div>

                    <div
                      className="
                        w-7
                        h-7
                        sm:w-9
                        sm:h-9
                        rounded-full
                        bg-slate-50
                        flex
                        items-center
                        justify-center
                        group-hover:bg-emerald-500
                        transition-colors
                      "
                    >
                      <ChevronRight
                        size={17}
                        className="
                          text-slate-400
                          group-hover:text-white
                        "
                      />
                    </div>
                  </div>

                  <h3
                    className="
                      text-lg
                      sm:text-xl
                      font-extrabold
                      text-slate-800
                      mt-4
                      group-hover:text-emerald-600
                    "
                  >
                    Instant
                  </h3>

                  <p
                    className="
                      text-[11px]
                      sm:text-xs
                      text-slate-500
                      mt-1
                    "
                  >
                    Ready to serve
                  </p>

                  <span
                    className="
                      inline-flex
                      mt-3
                      px-2
                      py-1
                      rounded-full
                      bg-emerald-50
                      text-emerald-600
                      text-[10px]
                      font-bold
                    "
                  >
                    {instantCategories.length} categories
                  </span>
                </div>
              </button>

              {/* HAVE TO COOK */}
              <button
                onClick={() =>
                  setSelectedFoodType(
                    "HAVE_TO_COOK"
                  )
                }
                className="
                  group
                  relative
                  overflow-hidden
                  text-left
                  bg-white
                  border
                  border-violet-100
                  rounded-2xl
                  p-4
                  sm:p-6
                  shadow-sm
                  hover:shadow-lg
                  hover:-translate-y-0.5
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    absolute
                    -right-8
                    -top-8
                    w-24
                    h-24
                    rounded-full
                    bg-violet-50
                  "
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className="
                        w-11
                        h-11
                        sm:w-14
                        sm:h-14
                        rounded-xl
                        bg-gradient-to-br
                        from-violet-100
                        to-fuchsia-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Flame
                        size={23}
                        className="text-violet-600"
                      />
                    </div>

                    <div
                      className="
                        w-7
                        h-7
                        sm:w-9
                        sm:h-9
                        rounded-full
                        bg-slate-50
                        flex
                        items-center
                        justify-center
                        group-hover:bg-violet-500
                        transition-colors
                      "
                    >
                      <ChevronRight
                        size={17}
                        className="
                          text-slate-400
                          group-hover:text-white
                        "
                      />
                    </div>
                  </div>

                  <h3
                    className="
                      text-lg
                      sm:text-xl
                      font-extrabold
                      text-slate-800
                      mt-4
                      group-hover:text-violet-600
                    "
                  >
                    Have to Cook
                  </h3>

                  <p
                    className="
                      text-[11px]
                      sm:text-xs
                      text-slate-500
                      mt-1
                    "
                  >
                    Freshly prepared
                  </p>

                  <span
                    className="
                      inline-flex
                      mt-3
                      px-2
                      py-1
                      rounded-full
                      bg-violet-50
                      text-violet-600
                      text-[10px]
                      font-bold
                    "
                  >
                    {cookingCategories.length} categories
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= CATEGORY ================= */}
        {selectedFoodType &&
          !selectedCategory && (
            <div>
              <button
                onClick={handleBack}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-lg
                  bg-white
                  border
                  border-slate-200
                  text-slate-600
                  hover:text-emerald-600
                  font-semibold
                  text-xs
                  shadow-sm
                  transition
                  mb-4
                "
              >
                <ArrowLeft size={15} />
                Back
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`
                      w-10
                      h-10
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      ${
                        selectedFoodType ===
                        "INSTANT"
                          ? "bg-emerald-100"
                          : "bg-violet-100"
                      }
                    `}
                  >
                    {selectedFoodType ===
                    "INSTANT" ? (
                      <Coffee
                        size={21}
                        className="text-emerald-600"
                      />
                    ) : (
                      <Flame
                        size={21}
                        className="text-violet-600"
                      />
                    )}
                  </div>

                  <div>
                    <h2
                      className="
                        text-xl
                        sm:text-2xl
                        font-extrabold
                        text-slate-800
                      "
                    >
                      {selectedFoodType ===
                      "INSTANT"
                        ? "Instant"
                        : "Have to Cook"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      Choose a category
                    </p>
                  </div>
                </div>
              </div>

              {currentCategories.length ===
              0 ? (
                <div
                  className="
                    py-12
                    text-center
                    bg-white
                    rounded-2xl
                    border
                    border-slate-100
                  "
                >
                  <Utensils
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    No categories available.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    lg:grid-cols-4
                    gap-3
                  "
                >
                  {currentCategories.map(
                    (category, index) => {
                      const itemCount =
                        currentTypeItems.filter(
                          (item) =>
                            item.categoryId ===
                            category.id
                        ).length;

                      const iconColors = [
                        "bg-emerald-100 text-emerald-600",
                        "bg-violet-100 text-violet-600",
                        "bg-cyan-100 text-cyan-600",
                        "bg-amber-100 text-amber-600",
                        "bg-pink-100 text-pink-600",
                        "bg-indigo-100 text-indigo-600",
                        "bg-teal-100 text-teal-600",
                        "bg-rose-100 text-rose-600",
                      ];

                      return (
                        <button
                          key={category.id}
                          onClick={() =>
                            setSelectedCategory(
                              category
                            )
                          }
                          className="
                            group
                            bg-white
                            border
                            border-slate-100
                            rounded-xl
                            p-3.5
                            sm:p-4
                            text-left
                            shadow-sm
                            hover:shadow-lg
                            hover:-translate-y-0.5
                            transition-all
                            duration-200
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                            "
                          >
                            <div
                              className={`
                                w-9
                                h-9
                                sm:w-10
                                sm:h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                ${
                                  iconColors[
                                    index %
                                      iconColors.length
                                  ]
                                }
                              `}
                            >
                              <Utensils size={18} />
                            </div>

                            <ChevronRight
                              size={17}
                              className="
                                text-slate-300
                                group-hover:text-emerald-500
                                transition
                              "
                            />
                          </div>

                          <h3
                            className="
                              text-sm
                              font-bold
                              text-slate-800
                              mt-3
                              truncate
                              group-hover:text-emerald-600
                            "
                          >
                            {category.name}
                          </h3>

                          <p
                            className="
                              text-[10px]
                              text-slate-400
                              mt-0.5
                            "
                          >
                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

        {/* ================= FOOD ITEMS ================= */}
        {selectedFoodType &&
          selectedCategory && (
            <div>
              <button
                onClick={handleBack}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-lg
                  bg-white
                  border
                  border-slate-200
                  text-slate-600
                  hover:text-emerald-600
                  font-semibold
                  text-xs
                  shadow-sm
                  transition
                  mb-4
                "
              >
                <ArrowLeft size={15} />
                Back to Categories
              </button>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-5
                  pb-4
                  border-b
                  border-slate-200
                "
              >
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-gradient-to-br
                    from-emerald-100
                    to-teal-100
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Utensils
                    size={22}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-extrabold
                      text-slate-800
                    "
                  >
                    {selectedCategory.name}
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {categoryItems.length}{" "}
                    {categoryItems.length === 1
                      ? "item"
                      : "items"}{" "}
                    available
                  </p>
                </div>
              </div>

              {categoryItems.length === 0 ? (
                <div
                  className="
                    py-12
                    text-center
                    bg-white
                    rounded-2xl
                    border
                    border-slate-100
                  "
                >
                  <Utensils
                    size={28}
                    className="
                      mx-auto
                      text-slate-300
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-slate-500
                    "
                  >
                    No food items available
                    in this category.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    gap-3
                    sm:gap-4
                  "
                >
                  {categoryItems.map(
                    (item) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
      </div>

      {/* ================= CUSTOMIZATION MODAL ================= */}
      {customizingItem && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-slate-950/60
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-3
            sm:p-5
          "
          onClick={handleCloseCustomization}
        >
          <div
            className="
              w-full
              max-w-lg
              max-h-[92vh]
              overflow-y-auto
              bg-white
              rounded-3xl
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div
              className="
                sticky
                top-0
                z-10
                bg-white
                border-b
                border-slate-100
                px-5
                py-4
                flex
                items-center
                justify-between
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    font-bold
                    text-emerald-600
                  "
                >
                  Customize your order
                </p>

                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-extrabold
                    text-slate-800
                    truncate
                    mt-0.5
                  "
                >
                  {customizingItem.name}
                </h2>
              </div>

              <button
                onClick={handleCloseCustomization}
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-slate-100
                  hover:bg-slate-200
                  flex
                  items-center
                  justify-center
                  text-slate-500
                  transition
                  shrink-0
                "
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Price + Quantity */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  p-3
                  rounded-2xl
                  bg-emerald-50
                  border
                  border-emerald-100
                "
              >
                <div>
                  <p className="text-xs text-slate-500">
                    Price
                  </p>

                  <p className="text-xl font-extrabold text-emerald-600">
                    ৳{Number(customizingItem.price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1.5 text-center">
                    Quantity
                  </p>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      bg-white
                      rounded-xl
                      p-1
                      border
                      border-slate-200
                    "
                  >
                    <button
                      onClick={() =>
                        setQuantity((value) =>
                          Math.max(1, value - 1)
                        )
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        bg-slate-100
                        hover:bg-slate-200
                        flex
                        items-center
                        justify-center
                        text-slate-600
                      "
                    >
                      <Minus size={15} />
                    </button>

                    <span
                      className="
                        w-7
                        text-center
                        font-bold
                        text-slate-800
                      "
                    >
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity((value) =>
                          Math.min(20, value + 1)
                        )
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        bg-emerald-100
                        hover:bg-emerald-200
                        flex
                        items-center
                        justify-center
                        text-emerald-700
                      "
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Spicy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      🌶️ Spicy Level
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Choose your preferred spice level
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["LESS", "Less Spicy"],
                      ["NORMAL", "Normal"],
                      ["MORE", "More Spicy"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setCustomization((current) => ({
                          ...current,
                          spicy: value,
                        }))
                      }
                      className={`
                        py-2.5
                        px-2
                        rounded-xl
                        border
                        text-xs
                        font-bold
                        transition
                        ${
                          customization.spicy ===
                          value
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sour */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      🍋 Sour Level
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Adjust the sourness
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["LESS", "Less Sour"],
                      ["NORMAL", "Normal"],
                      ["MORE", "More Sour"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setCustomization((current) => ({
                          ...current,
                          sour: value,
                        }))
                      }
                      className={`
                        py-2.5
                        px-2
                        rounded-xl
                        border
                        text-xs
                        font-bold
                        transition
                        ${
                          customization.sour ===
                          value
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">
                  Add or Remove Ingredients
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setCustomization((current) => ({
                        ...current,
                        noOnion: !current.noOnion,
                      }))
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                      rounded-xl
                      border
                      text-left
                      transition
                      ${
                        customization.noOnion
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      🧅 No Onion
                    </span>

                    <span
                      className={`
                        w-5
                        h-5
                        rounded-md
                        border
                        flex
                        items-center
                        justify-center
                        ${
                          customization.noOnion
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }
                      `}
                    >
                      {customization.noOnion && (
                        <CheckCircle2 size={14} />
                      )}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setCustomization((current) => ({
                        ...current,
                        noGarlic: !current.noGarlic,
                      }))
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                      rounded-xl
                      border
                      text-left
                      transition
                      ${
                        customization.noGarlic
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      🧄 No Garlic
                    </span>

                    <span
                      className={`
                        w-5
                        h-5
                        rounded-md
                        border
                        flex
                        items-center
                        justify-center
                        ${
                          customization.noGarlic
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }
                      `}
                    >
                      {customization.noGarlic && (
                        <CheckCircle2 size={14} />
                      )}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setCustomization((current) => ({
                        ...current,
                        extraCheese:
                          !current.extraCheese,
                      }))
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                      rounded-xl
                      border
                      text-left
                      transition
                      ${
                        customization.extraCheese
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      🧀 Extra Cheese
                    </span>

                    <span
                      className={`
                        w-5
                        h-5
                        rounded-md
                        border
                        flex
                        items-center
                        justify-center
                        ${
                          customization.extraCheese
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }
                      `}
                    >
                      {customization.extraCheese && (
                        <CheckCircle2 size={14} />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Other Instructions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareText
                    size={17}
                    className="text-emerald-600"
                  />

                  <h3 className="text-sm font-bold text-slate-800">
                    Other Instructions
                  </h3>
                </div>

                <textarea
                  value={
                    customization.otherInstructions
                  }
                  onChange={(event) =>
                    setCustomization((current) => ({
                      ...current,
                      otherInstructions:
                        event.target.value,
                    }))
                  }
                  placeholder="Example: make it a little hotter, less oil, extra sauce..."
                  maxLength={300}
                  rows={3}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-emerald-400
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

                <p className="text-[10px] text-slate-400 mt-1 text-right">
                  {
                    customization.otherInstructions
                      .length
                  }
                  /300
                </p>
              </div>

              {/* Selected Summary */}
              {buildSpecialInstructions() && (
                <div
                  className="
                    p-3
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                    Your instructions
                  </p>

                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    {buildSpecialInstructions()}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action */}
            <div
              className="
                sticky
                bottom-0
                bg-white
                border-t
                border-slate-100
                p-4
              "
            >
              <button
                onClick={handleConfirmAddToCart}
                className="
                  w-full
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-teal-500
                  hover:from-emerald-600
                  hover:to-teal-600
                  text-white
                  font-extrabold
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-md
                  active:scale-[0.99]
                  transition
                "
              >
                <ShoppingCart size={18} />

                Add{" "}
                {quantity > 1
                  ? `${quantity} Items`
                  : "to Cart"}

                <span className="opacity-80">
                  •
                </span>

                <span>
                  ৳
                  {(
                    Number(
                      customizingItem.price
                    ) * quantity
                  ).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
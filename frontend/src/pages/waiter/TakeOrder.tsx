import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Utensils,
  UserRound,
  Receipt,
  Send,
  X,
  ArrowLeft,
  ChevronRight,
  Coffee,
  Flame,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  ChefHat,
} from "lucide-react";

import api from "../../api/axios";

interface Table {
  id: number;
  tableNumber: number | string;
  name?: string;
  status?: string;
}

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

type CustomizationOption = "LESS" | "NORMAL" | "MORE";

interface CustomizationState {
  spicy: CustomizationOption;
  sour: CustomizationOption;
  noOnion: boolean;
  noGarlic: boolean;
  extraCheese: boolean;
  otherInstructions: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  categoryId?: number;
  quantity: number;
  specialInstructions?: string;
}

type FoodType = "INSTANT" | "HAVE_TO_COOK";

const defaultCustomization: CustomizationState = {
  spicy: "NORMAL",
  sour: "NORMAL",
  noOnion: false,
  noGarlic: false,
  extraCheese: false,
  otherInstructions: "",
};

const TakeOrder = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  // =========================
  // DATA
  // =========================

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableNumber, setTableNumber] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  // =========================
  // MENU STATE
  // =========================

  const [selectedFoodType, setSelectedFoodType] =
    useState<FoodType | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [search, setSearch] = useState("");

  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState<CartItem[]>([]);
  const [instructions, setInstructions] = useState("");

  // =========================
  // CUSTOMIZATION
  // =========================

  const [customizingItem, setCustomizingItem] =
    useState<MenuItem | null>(null);

  const [customization, setCustomization] =
    useState<CustomizationState>({
      ...defaultCustomization,
    });

  const [customizationQuantity, setCustomizationQuantity] =
    useState(1);

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    loadData();
  }, [tableId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        menuResponse,
        categoryResponse,
        tableResponse,
      ] = await Promise.all([
        api.get("/menu-items"),
        api.get("/categories"),
        api.get("/tables"),
      ]);

      setMenuItems(
        Array.isArray(menuResponse.data)
          ? menuResponse.data
          : []
      );

      setCategories(
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : []
      );

      const tables: Table[] = Array.isArray(
        tableResponse.data
      )
        ? tableResponse.data
        : [];

      const selectedTable = tables.find(
        (table) =>
          Number(table.id) === Number(tableId)
      );

      if (selectedTable) {
        setTableNumber(
          String(selectedTable.tableNumber)
        );
      } else {
        setTableNumber("—");
      }
    } catch (error) {
      console.error(
        "Failed to load order data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FOOD TYPE
  // =========================

  const normalizeFoodType = (
    value?: string
  ) => {
    if (!value) return "";

    return value
      .toUpperCase()
      .replace(/[\s_-]/g, "");
  };

  // =========================
  // AVAILABILITY
  // =========================

  const isAvailable = (
    item: MenuItem
  ) => {
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

  // =========================
  // FOOD TYPE ITEMS
  // =========================

  const instantItems = useMemo(() => {
    return menuItems.filter((item) => {
      const type = normalizeFoodType(
        item.foodType ||
          item.preparationType
      );

      return type === "INSTANT";
    });
  }, [menuItems]);

  const cookingItems = useMemo(() => {
    return menuItems.filter((item) => {
      const type = normalizeFoodType(
        item.foodType ||
          item.preparationType
      );

      return (
        type === "COOKED" ||
        type === "HAVETOCOOK"
      );
    });
  }, [menuItems]);

  // =========================
  // CATEGORY HELPERS
  // =========================

  const getCategoriesForItems = (
    items: MenuItem[]
  ) => {
    const ids = new Set<number>();

    items.forEach((item) => {
      if (item.categoryId) {
        ids.add(item.categoryId);
      }
    });

    return categories.filter((category) =>
      ids.has(category.id)
    );
  };

  const instantCategories = useMemo(
    () =>
      getCategoriesForItems(
        instantItems
      ),
    [instantItems, categories]
  );

  const cookingCategories = useMemo(
    () =>
      getCategoriesForItems(
        cookingItems
      ),
    [cookingItems, categories]
  );

  const currentItems = useMemo(() => {
    if (!selectedFoodType) return [];

    return selectedFoodType === "INSTANT"
      ? instantItems
      : cookingItems;
  }, [
    selectedFoodType,
    instantItems,
    cookingItems,
  ]);

  const currentCategories = useMemo(() => {
    if (!selectedFoodType) return [];

    return selectedFoodType === "INSTANT"
      ? instantCategories
      : cookingCategories;
  }, [
    selectedFoodType,
    instantCategories,
    cookingCategories,
  ]);

  // =========================
  // CATEGORY ITEMS
  // =========================

  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];

    return currentItems.filter(
      (item) =>
        item.categoryId ===
        selectedCategory.id
    );
  }, [
    selectedCategory,
    currentItems,
  ]);

  // =========================
  // SEARCH
  // =========================

  const filteredMenu = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return categoryItems;

    return categoryItems.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [categoryItems, search]);

  // =========================
  // CUSTOMIZATION
  // =========================

  const handleOpenCustomization = (
    food: MenuItem
  ) => {
    if (!isAvailable(food)) return;

    setCustomizingItem(food);

    setCustomization({
      ...defaultCustomization,
    });

    setCustomizationQuantity(1);
  };

  const handleCloseCustomization = () => {
    setCustomizingItem(null);

    setCustomization({
      ...defaultCustomization,
    });

    setCustomizationQuantity(1);
  };

  const buildSpecialInstructions = () => {
    const result: string[] = [];

    if (customization.spicy !== "NORMAL") {
      result.push(
        `Spicy: ${
          customization.spicy === "LESS"
            ? "Less"
            : "More"
        }`
      );
    }

    if (customization.sour !== "NORMAL") {
      result.push(
        `Sour: ${
          customization.sour === "LESS"
            ? "Less"
            : "More"
        }`
      );
    }

    if (customization.noOnion) {
      result.push("No Onion");
    }

    if (customization.noGarlic) {
      result.push("No Garlic");
    }

    if (customization.extraCheese) {
      result.push("Extra Cheese");
    }

    const other =
      customization.otherInstructions.trim();

    if (other) {
      result.push(`Note: ${other}`);
    }

    return result.join(", ");
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;

    const specialInstructions =
      buildSpecialInstructions();

    const price = Number(
      customizingItem.price
    );

    setCart((current) => {
      const normalizedInstructions =
        specialInstructions.trim();

      const existingIndex =
        current.findIndex(
          (item) =>
            item.id === customizingItem.id &&
            (item.specialInstructions
              ?.trim() || "") ===
              normalizedInstructions
        );

      if (existingIndex !== -1) {
        return current.map(
          (item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    customizationQuantity,
                }
              : item
        );
      }

      return [
        ...current,
        {
          id: customizingItem.id,
          name: customizingItem.name,
          price,
          image: customizingItem.image,
          categoryId:
            customizingItem.categoryId,
          quantity:
            customizationQuantity,
          specialInstructions:
            normalizedInstructions ||
            undefined,
        },
      ];
    });

    handleCloseCustomization();
  };

  // =========================
  // CART
  // =========================

  const increase = (
    index: number
  ) => {
    setCart((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decrease = (
    index: number
  ) => {
    setCart((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const removeItem = (
    index: number
  ) => {
    setCart((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // =========================
  // TOTALS
  // =========================

  const itemCount = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      item.price * item.quantity,
    0
  );

  const total = subtotal;

  // =========================
  // BACK
  // =========================

  const handleBack = () => {
    setSearch("");

    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    if (selectedFoodType) {
      setSelectedFoodType(null);
    }
  };

  // =========================
  // CONFIRM ORDER
  // =========================

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      alert(
        "Please add at least one item to the order."
      );
      return;
    }

    if (!tableId) {
      alert(
        "Table is missing. Please select a table first."
      );
      return;
    }

    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        alert(
          "Waiter login information not found. Please login again."
        );

        navigate("/login");
        return;
      }

      const currentUser =
        JSON.parse(storedUser);

      const waiterId = Number(
        currentUser?.id
      );

      if (
        !waiterId ||
        Number.isNaN(waiterId)
      ) {
        alert(
          "Invalid waiter information. Please login again."
        );

        return;
      }

      if (
        currentUser?.role &&
        currentUser.role !== "WAITER"
      ) {
        alert(
          "Please login with a waiter account."
        );

        return;
      }
    } catch (error) {
      console.error(
        "Failed to validate waiter:",
        error
      );

      alert(
        "Login information is invalid. Please login again."
      );

      navigate("/login");
      return;
    }

    navigate(
      "/waiter/order-confirmation",
      {
        state: {
          tableId: Number(tableId),
          tableNumber,
          cart,
          instructions,
        },
      }
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-emerald-100
              border-t-emerald-500
            "
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading menu...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">

      {/* HEADER */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          bg-gradient-to-r
          from-emerald-600
          via-teal-500
          to-cyan-500
          p-4
          text-white
          shadow-md
          sm:p-5
        "
      >
        <div className="flex items-center justify-between gap-3">

          <div>

            <div className="mb-1 flex items-center gap-2">

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/15
                "
              >
                <Utensils size={17} />
              </div>

              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-white/80
                "
              >
                New Order
              </span>

            </div>

            <h1 className="text-2xl font-bold">
              Table {tableNumber}
            </h1>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
              <UserRound size={14} />
              Walk-in Customer
            </div>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-white/15
              px-3
              py-2
            "
          >
            <ShoppingCart size={17} />

            <span className="text-sm font-semibold">
              {itemCount} Items
            </span>
          </div>

        </div>
      </div>

      {/* FOOD TYPE */}

      {!selectedFoodType && (
        <div>

          <div className="mb-3">

            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Menu
            </p>

            <h2 className="text-xl font-extrabold text-slate-800">
              Choose Food Type
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a menu section to start the order.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3">

            {/* INSTANT */}

            <button
              onClick={() =>
                setSelectedFoodType(
                  "INSTANT"
                )
              }
              className="
                group
                rounded-2xl
                border
                border-emerald-100
                bg-white
                p-4
                text-left
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <Coffee size={22} />
                </div>

                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-emerald-500"
                />

              </div>

              <h3 className="mt-3 text-base font-bold text-gray-800">
                Instant
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Ready to serve
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-emerald-600
                "
              >
                {instantCategories.length} categories
              </span>

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
                rounded-2xl
                border
                border-violet-100
                bg-white
                p-4
                text-left
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-50
                    text-violet-600
                  "
                >
                  <Flame size={22} />
                </div>

                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-violet-500"
                />

              </div>

              <h3 className="mt-3 text-base font-bold text-gray-800">
                Have to Cook
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Freshly prepared
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  rounded-full
                  bg-violet-50
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-violet-600
                "
              >
                {cookingCategories.length} categories
              </span>

            </button>

          </div>
        </div>
      )}

      {/* CATEGORY */}

      {selectedFoodType &&
        !selectedCategory && (
          <div>

            <button
              onClick={handleBack}
              className="
                mb-3
                flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-gray-600
                hover:text-emerald-600
              "
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div className="mb-3 flex items-center gap-2.5">

              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    selectedFoodType ===
                    "INSTANT"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-violet-50 text-violet-600"
                  }
                `}
              >
                {selectedFoodType ===
                "INSTANT" ? (
                  <Coffee size={20} />
                ) : (
                  <Flame size={20} />
                )}
              </div>

              <div>

                <h2 className="text-lg font-extrabold text-gray-800">
                  {selectedFoodType ===
                  "INSTANT"
                    ? "Instant"
                    : "Have to Cook"}
                </h2>

                <p className="text-xs text-gray-400">
                  Choose category
                </p>

              </div>

            </div>

            {currentCategories.length ===
            0 ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  py-12
                  text-center
                "
              >

                <Utensils
                  size={25}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm text-gray-500">
                  No categories available.
                </p>

              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  lg:grid-cols-4
                "
              >

                {currentCategories.map(
                  (category, index) => {

                    const categoryItemCount =
                      currentItems.filter(
                        (item) =>
                          item.categoryId ===
                          category.id
                      ).length;

                    const iconStyles = [
                      "bg-emerald-50 text-emerald-600",
                      "bg-violet-50 text-violet-600",
                      "bg-cyan-50 text-cyan-600",
                      "bg-indigo-50 text-indigo-600",
                      "bg-pink-50 text-pink-600",
                      "bg-amber-50 text-amber-600",
                    ];

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(
                            category
                          );
                          setSearch("");
                        }}
                        className="
                          group
                          rounded-xl
                          border
                          border-gray-100
                          bg-white
                          p-3
                          text-left
                          shadow-sm
                          transition
                          hover:-translate-y-0.5
                          hover:shadow-md
                        "
                      >

                        <div className="flex items-center justify-between">

                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                iconStyles[
                                  index %
                                    iconStyles.length
                                ]
                              }
                            `}
                          >
                            <Utensils size={18} />
                          </div>

                          <ChevronRight
                            size={17}
                            className="text-gray-300 group-hover:text-emerald-500"
                          />

                        </div>

                        <h3 className="mt-3 truncate text-sm font-bold text-gray-800">
                          {category.name}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {categoryItemCount} items
                        </p>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

      {/* FOOD ITEMS + CURRENT ORDER */}

      {selectedFoodType &&
        selectedCategory && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              xl:grid-cols-12
            "
          >

            {/* MENU */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                xl:col-span-8
              "
            >

              <div className="border-b border-gray-100 p-4">

                <button
                  onClick={handleBack}
                  className="
                    mb-3
                    flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-gray-600
                    hover:text-emerald-600
                  "
                >
                  <ArrowLeft size={14} />
                  Categories
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  <div className="flex-1">

                    <h2 className="text-lg font-extrabold text-gray-800">
                      {selectedCategory.name}
                    </h2>

                    <p className="text-xs text-gray-400">
                      {categoryItems.length} items
                    </p>

                  </div>

                  <div className="relative sm:w-56">

                    <Search
                      size={16}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                      "
                    />

                    <input
                      type="text"
                      placeholder="Search food..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        py-2.5
                        pl-9
                        pr-3
                        text-sm
                        outline-none
                        focus:border-emerald-400
                        focus:ring-2
                        focus:ring-emerald-100
                      "
                    />

                  </div>

                </div>
              </div>

              <div className="p-4">

                {filteredMenu.length === 0 ? (
                  <div className="py-12 text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-50
                        text-gray-400
                      "
                    >
                      <Search size={20} />
                    </div>

                    <p className="mt-3 text-sm text-gray-500">
                      No food items found.
                    </p>

                  </div>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      lg:grid-cols-3
                    "
                  >

                    {filteredMenu.map(
                      (food) => {

                        const available =
                          isAvailable(food);

                        const cartQuantity =
                          cart
                            .filter(
                              (item) =>
                                item.id ===
                                food.id
                            )
                            .reduce(
                              (
                                sum,
                                item
                              ) =>
                                sum +
                                item.quantity,
                              0
                            );

                        return (
                          <div
                            key={food.id}
                            className="
                              group
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-100
                              bg-white
                              p-3
                              transition
                              hover:border-emerald-200
                              hover:shadow-md
                            "
                          >

                            <div
                              className="
                                relative
                                flex
                                h-28
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                bg-gradient-to-br
                                from-emerald-50
                                to-cyan-50
                              "
                            >

                              {food.image ? (
                                <img
                                  src={
                                    food.image
                                  }
                                  alt={
                                    food.name
                                  }
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition
                                    group-hover:scale-105
                                  "
                                />
                              ) : (
                                <Utensils
                                  size={27}
                                  className="text-emerald-400"
                                />
                              )}

                              <div className="absolute left-2 top-2">

                                {available ? (
                                  <span
                                    className="
                                      flex
                                      items-center
                                      gap-1
                                      rounded-full
                                      bg-white/95
                                      px-2
                                      py-1
                                      text-[9px]
                                      font-bold
                                      text-emerald-600
                                      shadow-sm
                                    "
                                  >
                                    <CheckCircle2
                                      size={10}
                                    />
                                    Available
                                  </span>
                                ) : (
                                  <span
                                    className="
                                      flex
                                      items-center
                                      gap-1
                                      rounded-full
                                      bg-white/95
                                      px-2
                                      py-1
                                      text-[9px]
                                      font-bold
                                      text-red-500
                                      shadow-sm
                                    "
                                  >
                                    <XCircle
                                      size={10}
                                    />
                                    Unavailable
                                  </span>
                                )}

                              </div>

                              {cartQuantity > 0 && (
                                <div
                                  className="
                                    absolute
                                    right-2
                                    top-2
                                    flex
                                    h-7
                                    min-w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-violet-600
                                    px-2
                                    text-xs
                                    font-bold
                                    text-white
                                  "
                                >
                                  {cartQuantity}
                                </div>
                              )}

                            </div>

                            <h3 className="mt-3 truncate text-sm font-bold text-gray-800">
                              {food.name}
                            </h3>

                            <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                              {food.description ||
                                selectedCategory.name}
                            </p>

                            <div className="mt-3 flex items-center justify-between gap-2">

                              <span className="text-sm font-extrabold text-emerald-600">
                                ৳
                                {Number(
                                  food.price
                                )}
                              </span>

                              <button
                                disabled={
                                  !available
                                }
                                onClick={() =>
                                  handleOpenCustomization(
                                    food
                                  )
                                }
                                className={`
                                  flex
                                  items-center
                                  gap-1
                                  rounded-lg
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  transition
                                  ${
                                    available
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-105"
                                      : "cursor-not-allowed bg-gray-100 text-gray-400"
                                  }
                                `}
                              >
                                <Plus size={14} />
                                Add
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </div>

            {/* CURRENT ORDER */}

            <div
              className="
                h-fit
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                xl:sticky
                xl:top-4
                xl:col-span-4
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  p-4
                "
              >

                <div>

                  <h2 className="font-bold text-gray-800">
                    Current Order
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Table {tableNumber}
                  </p>

                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-50
                    text-violet-600
                  "
                >
                  <Receipt size={18} />
                </div>

              </div>

              {/* CART */}

              <div className="max-h-[380px] overflow-y-auto p-4">

                {cart.length === 0 ? (
                  <div className="py-10 text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gray-50
                        text-gray-300
                      "
                    >
                      <ShoppingCart size={25} />
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-500">
                      No items selected
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Add food items from the menu.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-2.5">

                    {cart.map(
                      (item, index) => (
                        <div
                          key={`${item.id}-${item.specialInstructions || "none"}-${index}`}
                          className="
                            rounded-xl
                            border
                            border-gray-100
                            bg-gray-50/60
                            p-3
                          "
                        >

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <h3 className="truncate text-sm font-semibold text-gray-800">
                                {item.name}
                              </h3>

                              <p className="mt-0.5 text-xs text-gray-400">
                                ৳{item.price} ×{" "}
                                {item.quantity}
                              </p>

                            </div>

                            <div className="text-sm font-bold text-emerald-600">
                              ৳
                              {(
                                item.price *
                                item.quantity
                              ).toFixed(2)}
                            </div>

                          </div>

                          {/* SPECIAL INSTRUCTIONS */}

                          {item.specialInstructions && (
                            <div
                              className="
                                mt-2
                                rounded-lg
                                border
                                border-amber-100
                                bg-amber-50
                                p-2
                              "
                            >

                              <div className="flex items-start gap-1.5">

                                <MessageSquareText
                                  size={13}
                                  className="mt-0.5 shrink-0 text-amber-600"
                                />

                                <div>

                                  <p className="text-[9px] font-bold uppercase tracking-wide text-amber-600">
                                    Special Instructions
                                  </p>

                                  <p className="mt-0.5 text-[11px] leading-4 text-amber-800">
                                    {item.specialInstructions}
                                  </p>

                                </div>

                              </div>

                            </div>
                          )}

                          <div className="mt-2.5 flex items-center justify-between">

                            <button
                              onClick={() =>
                                removeItem(
                                  index
                                )
                              }
                              className="
                                text-gray-400
                                transition
                                hover:text-red-500
                              "
                              title="Remove"
                            >
                              <Trash2 size={15} />
                            </button>

                            <div className="flex items-center gap-2">

                              <button
                                onClick={() =>
                                  decrease(
                                    index
                                  )
                                }
                                className="
                                  flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-red-50
                                  text-red-500
                                  hover:bg-red-100
                                "
                              >
                                <Minus size={14} />
                              </button>

                              <span className="w-5 text-center text-sm font-semibold text-gray-700">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  increase(
                                    index
                                  )
                                }
                                className="
                                  flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-emerald-50
                                  text-emerald-600
                                  hover:bg-emerald-100
                                "
                              >
                                <Plus size={14} />
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* SUMMARY */}

              <div className="border-t border-gray-100 p-4">

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>

                    <span>
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      border-t
                      border-gray-100
                      pt-2
                      text-base
                      font-bold
                      text-gray-800
                    "
                  >
                    <span>Total</span>

                    <span className="text-emerald-600">
                      ৳{total.toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* GENERAL ORDER INSTRUCTIONS */}

                <textarea
                  rows={2}
                  maxLength={300}
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(
                      e.target.value
                    )
                  }
                  placeholder="General order instructions..."
                  className="
                    mt-4
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3
                    text-sm
                    outline-none
                    focus:border-emerald-400
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

                {/* ACTIONS */}

                <div className="mt-3 grid grid-cols-2 gap-2.5">

                  <button
                    onClick={() => {
                      setCart([]);
                      setInstructions("");
                    }}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      bg-gray-100
                      py-2.5
                      text-sm
                      font-semibold
                      text-gray-600
                      transition
                      hover:bg-gray-200
                    "
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    disabled={
                      cart.length === 0
                    }
                    onClick={
                      handleConfirmOrder
                    }
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      py-2.5
                      text-sm
                      font-semibold
                      transition
                      ${
                        cart.length === 0
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-sm hover:shadow-md"
                      }
                    `}
                  >
                    <Send size={16} />
                    Confirm Order
                  </button>

                </div>

              </div>
            </div>

          </div>
        )}

      {/* CUSTOMIZATION MODAL */}

      {customizingItem && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/60
            p-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              max-h-[92vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                bg-white
                p-4
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    bg-gradient-to-br
                    from-emerald-50
                    to-cyan-50
                  "
                >

                  {customizingItem.image ? (
                    <img
                      src={
                        customizingItem.image
                      }
                      alt={
                        customizingItem.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ChefHat
                      size={21}
                      className="text-emerald-500"
                    />
                  )}

                </div>

                <div>

                  <h2 className="text-base font-extrabold text-gray-800">
                    Customize Item
                  </h2>

                  <p className="text-xs text-gray-400">
                    {customizingItem.name}
                  </p>

                </div>

              </div>

              <button
                onClick={
                  handleCloseCustomization
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-gray-100
                  text-gray-500
                  transition
                  hover:bg-gray-200
                "
              >
                <X size={17} />
              </button>

            </div>

            <div className="space-y-5 p-4">

              {/* QUANTITY */}

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Quantity
                </p>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3
                  "
                >

                  <span className="text-sm font-semibold text-gray-700">
                    Number of items
                  </span>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        setCustomizationQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                        text-red-500
                        hover:bg-red-100
                      "
                    >
                      <Minus size={15} />
                    </button>

                    <span className="w-6 text-center text-sm font-bold text-gray-800">
                      {customizationQuantity}
                    </span>

                    <button
                      onClick={() =>
                        setCustomizationQuantity(
                          (value) =>
                            Math.min(
                              20,
                              value + 1
                            )
                        )
                      }
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-50
                        text-emerald-600
                        hover:bg-emerald-100
                      "
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>

              </div>

              {/* SPICY */}

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Spicy Level
                </p>

                <div className="grid grid-cols-3 gap-2">

                  {(
                    [
                      "LESS",
                      "NORMAL",
                      "MORE",
                    ] as CustomizationOption[]
                  ).map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setCustomization(
                          (current) => ({
                            ...current,
                            spicy: option,
                          })
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        transition
                        ${
                          customization.spicy ===
                          option
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "border-gray-200 bg-white text-gray-500 hover:border-red-200"
                        }
                      `}
                    >
                      {option === "LESS"
                        ? "Less"
                        : option === "NORMAL"
                        ? "Normal"
                        : "More"}
                    </button>
                  ))}

                </div>

              </div>

              {/* SOUR */}

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Sour Level
                </p>

                <div className="grid grid-cols-3 gap-2">

                  {(
                    [
                      "LESS",
                      "NORMAL",
                      "MORE",
                    ] as CustomizationOption[]
                  ).map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setCustomization(
                          (current) => ({
                            ...current,
                            sour: option,
                          })
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        transition
                        ${
                          customization.sour ===
                          option
                            ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                            : "border-gray-200 bg-white text-gray-500 hover:border-cyan-200"
                        }
                      `}
                    >
                      {option === "LESS"
                        ? "Less"
                        : option === "NORMAL"
                        ? "Normal"
                        : "More"}
                    </button>
                  ))}

                </div>

              </div>

              {/* FOOD PREFERENCES */}

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Food Preferences
                </p>

                <div className="space-y-2">

                  {/* NO ONION */}

                  <button
                    onClick={() =>
                      setCustomization(
                        (current) => ({
                          ...current,
                          noOnion:
                            !current.noOnion,
                        })
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition
                      ${
                        customization.noOnion
                          ? "border-amber-300 bg-amber-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >

                    <span className="text-sm font-semibold text-gray-700">
                      No Onion
                    </span>

                    <span
                      className={`
                        flex
                        h-6
                        w-10
                        items-center
                        rounded-full
                        p-1
                        transition
                        ${
                          customization.noOnion
                            ? "justify-end bg-amber-500"
                            : "justify-start bg-gray-200"
                        }
                      `}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </span>

                  </button>

                  {/* NO GARLIC */}

                  <button
                    onClick={() =>
                      setCustomization(
                        (current) => ({
                          ...current,
                          noGarlic:
                            !current.noGarlic,
                        })
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition
                      ${
                        customization.noGarlic
                          ? "border-violet-300 bg-violet-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >

                    <span className="text-sm font-semibold text-gray-700">
                      No Garlic
                    </span>

                    <span
                      className={`
                        flex
                        h-6
                        w-10
                        items-center
                        rounded-full
                        p-1
                        transition
                        ${
                          customization.noGarlic
                            ? "justify-end bg-violet-500"
                            : "justify-start bg-gray-200"
                        }
                      `}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </span>

                  </button>

                  {/* EXTRA CHEESE */}

                  <button
                    onClick={() =>
                      setCustomization(
                        (current) => ({
                          ...current,
                          extraCheese:
                            !current.extraCheese,
                        })
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition
                      ${
                        customization.extraCheese
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >

                    <span className="text-sm font-semibold text-gray-700">
                      Extra Cheese
                    </span>

                    <span
                      className={`
                        flex
                        h-6
                        w-10
                        items-center
                        rounded-full
                        p-1
                        transition
                        ${
                          customization.extraCheese
                            ? "justify-end bg-emerald-500"
                            : "justify-start bg-gray-200"
                        }
                      `}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </span>

                  </button>

                </div>

              </div>

              {/* OTHER INSTRUCTIONS */}

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <MessageSquareText
                    size={15}
                    className="text-emerald-600"
                  />

                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Other Instructions
                  </p>

                </div>

                <textarea
                  rows={3}
                  maxLength={300}
                  value={
                    customization.otherInstructions
                  }
                  onChange={(e) =>
                    setCustomization(
                      (current) => ({
                        ...current,
                        otherInstructions:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Example: jhal beshi, tok beshi, less oil..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3
                    text-sm
                    outline-none
                    focus:border-emerald-400
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

                <p className="mt-1 text-right text-[10px] text-gray-400">
                  {
                    customization.otherInstructions
                      .length
                  }
                  /300
                </p>

              </div>

              {/* KITCHEN SUMMARY */}

              {buildSpecialInstructions() && (
                <div
                  className="
                    rounded-xl
                    border
                    border-amber-100
                    bg-amber-50
                    p-3
                  "
                >

                  <div className="flex items-start gap-2">

                    <ChefHat
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>

                      <p className="text-xs font-bold text-amber-700">
                        Kitchen Instructions
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        {buildSpecialInstructions()}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* ADD BUTTON */}

              <button
                onClick={
                  handleConfirmCustomization
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-emerald-500
                  via-teal-500
                  to-cyan-500
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:brightness-105
                  hover:shadow-md
                "
              >

                <ShoppingCart size={17} />

                Add{" "}
                {customizationQuantity} to Order

                <span className="ml-1 rounded-lg bg-white/15 px-2 py-1">
                  ৳
                  {(
                    Number(
                      customizingItem.price
                    ) *
                    customizationQuantity
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

export default TakeOrder;
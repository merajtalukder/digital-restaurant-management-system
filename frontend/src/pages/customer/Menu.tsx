import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  preparationType?: string;
  category?: Category;
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // =========================
  // GET TABLE FROM QR URL
  // =========================

  const [searchParams] = useSearchParams();

  const tableIdFromUrl = searchParams.get("table");

  // =========================
  // SAVE TABLE ID
  // =========================

  useEffect(() => {
    if (tableIdFromUrl) {
      localStorage.setItem("customerTableId", tableIdFromUrl);
    }
  }, [tableIdFromUrl]);

  // Cart Context
  const { addToCart } = useCart();

  // =========================
  // FETCH MENU
  // =========================

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get("/menu-items");

        console.log("Menu Items:", response.data);

        setMenuItems(response.data);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...Array.from(
      new Set(
        menuItems
          .map((item) => item.category?.name)
          .filter(Boolean) as string[]
      )
    ),
  ];

  // =========================
  // FILTER
  // =========================

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category?.name === selectedCategory
        );

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  };

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Our Menu
        </h1>

        <p className="text-gray-500 mt-1">
          Choose your favorite food
        </p>

        {/* ================= TABLE INFO ================= */}

        {localStorage.getItem("customerTableId") && (
          <div className="mt-3 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-semibold">
            🪑 Table{" "}
            {localStorage.getItem("customerTableId")}
          </div>
        )}

      </div>

      {/* ================= CATEGORIES ================= */}

      <div className="flex gap-3 overflow-x-auto pb-4">

        {categories.map((category) => (

          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
              selectedCategory === category
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {category}
          </button>

        ))}

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="text-center py-10">

          <p className="text-gray-500">
            Loading menu...
          </p>

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && filteredItems.length === 0 && (

        <div className="bg-white rounded-xl p-8 text-center shadow">

          <p className="text-gray-500">
            No menu items available.
          </p>

        </div>

      )}

      {/* ================= MENU ITEMS ================= */}

      {!loading && filteredItems.length > 0 && (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredItems.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border"
            >

              {/* ================= IMAGE ================= */}

              <div className="h-44 bg-gray-100 flex items-center justify-center">

                {item.image ? (

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <span className="text-5xl">
                    🍽️
                  </span>

                )}

              </div>

              {/* ================= DETAILS ================= */}

              <div className="p-4">

                <div className="flex justify-between items-start gap-3">

                  <div>

                    <h2 className="text-lg font-bold text-gray-800">
                      {item.name}
                    </h2>

                    {item.category?.name && (

                      <p className="text-sm text-orange-500 mt-1">
                        {item.category.name}
                      </p>

                    )}

                  </div>

                  <span className="font-bold text-orange-500 whitespace-nowrap">
                    ৳{item.price}
                  </span>

                </div>

                {/* ================= DESCRIPTION ================= */}

                {item.description && (

                  <p className="text-sm text-gray-500 mt-3">
                    {item.description}
                  </p>

                )}

                {/* ================= PREPARATION TYPE ================= */}

                {item.preparationType && (

                  <span className="inline-block mt-3 text-xs bg-gray-100 px-3 py-1 rounded-full">
                    {item.preparationType}
                  </span>

                )}

                {/* ================= ADD TO CART ================= */}

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  + Add to Cart
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default Menu;

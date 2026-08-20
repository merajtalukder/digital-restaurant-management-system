import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  foodType: "INSTANT" | "COOKED";
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
}

const API_URL = "http://localhost:3000";

const MenuItems = () => {
  // =========================
  // FORM
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [itemName, setItemName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [foodType, setFoodType] =
    useState<"INSTANT" | "COOKED">("INSTANT");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // =========================
  // DATA
  // =========================

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // SEARCH & FILTER
  // =========================

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterAvailability, setFilterAvailability] =
    useState<"All" | "Available" | "Unavailable">("All");

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data: Category[] = await response.json();

      setCategories(data);

      if (data.length > 0 && !categoryId) {
        setCategoryId(String(data[0].id));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load categories.");
    }
  };

  // =========================
  // FETCH MENU ITEMS
  // =========================

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/menu-items`);

      if (!response.ok) {
        throw new Error("Failed to load menu items");
      }

      const data: MenuItem[] = await response.json();

      setMenuItems(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAdd = () => {
    setEditingId(null);

    setItemName("");

    if (categories.length > 0) {
      setCategoryId(String(categories[0].id));
    } else {
      setCategoryId("");
    }

    setFoodType("INSTANT");
    setPrice("");
    setDescription("");
    setIsAvailable(true);

    setShowForm(true);
  };

  // =========================
  // SAVE / UPDATE
  // =========================

  const handleSave = async () => {
    if (!itemName.trim()) {
      alert("Please enter item name.");
      return;
    }

    if (!categoryId) {
      alert("Please select a category.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);

      const menuItemData = {
        name: itemName.trim(),
        description: description.trim() || null,
        price: Number(price),
        foodType,
        categoryId: Number(categoryId),
        isAvailable,
      };

      let response: Response;

      // =========================
      // UPDATE
      // =========================

      if (editingId !== null) {
        response = await fetch(
          `${API_URL}/menu-items/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(menuItemData),
          }
        );
      }

      // =========================
      // CREATE
      // =========================

      else {
        response = await fetch(`${API_URL}/menu-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(menuItemData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save menu item");
      }

      await fetchMenuItems();

      resetForm();

      alert(
        editingId !== null
          ? "Menu item updated successfully."
          : "Menu item added successfully."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);

    setItemName(item.name);
    setCategoryId(String(item.categoryId));
    setFoodType(item.foodType);
    setPrice(String(item.price));
    setDescription(item.description || "");
    setIsAvailable(item.isAvailable);

    // IMPORTANT:
    // Edit mode only shows the form.
    // List will NOT render.
    setShowForm(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/menu-items/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete menu item");
      }

      await fetchMenuItems();

      alert("Menu item deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete menu item.");
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);

    setItemName("");

    if (categories.length > 0) {
      setCategoryId(String(categories[0].id));
    } else {
      setCategoryId("");
    }

    setFoodType("INSTANT");
    setPrice("");
    setDescription("");
    setIsAvailable(true);
  };

  // =========================
  // FILTER
  // =========================

  const filteredItems = menuItems.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      (item.description || "")
        .toLowerCase()
        .includes(searchText) ||
      (item.category?.name || "")
        .toLowerCase()
        .includes(searchText);

    const matchesCategory =
      filterCategory === "All" ||
      item.categoryId === Number(filterCategory);

    const matchesAvailability =
      filterAvailability === "All" ||
      (filterAvailability === "Available" &&
        item.isAvailable) ||
      (filterAvailability === "Unavailable" &&
        !item.isAvailable);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability
    );
  });

  // ============================================================
  // FORM VIEW
  // ============================================================

  if (showForm) {
    return (
      <div>
        {/* ================= HEADER ================= */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {editingId !== null
                ? "Edit Menu Item"
                : "Add Menu Item"}
            </h2>

            <p className="mt-2 text-gray-600">
              {editingId !== null
                ? "Update menu item information"
                : "Add a new item to your restaurant menu"}
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg bg-gray-100 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
          >
            ← Back to Menu
          </button>
        </div>

        {/* ================= FORM CARD ================= */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-gray-100 pb-5">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId !== null
                ? "Menu Item Details"
                : "New Menu Item"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Fill in the information below.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* ITEM NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item Name
              </label>

              <input
                type="text"
                value={itemName}
                onChange={(e) =>
                  setItemName(e.target.value)
                }
                placeholder="e.g. Chicken Burger"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FOOD TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Preparation Type
              </label>

              <select
                value={foodType}
                onChange={(e) =>
                  setFoodType(
                    e.target.value as
                      | "INSTANT"
                      | "COOKED"
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
              >
                <option value="INSTANT">
                  Instant
                </option>

                <option value="COOKED">
                  Have to Cook
                </option>
              </select>
            </div>

            {/* PRICE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price (৳)
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="e.g. 250"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
              />
            </div>

            {/* AVAILABILITY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Availability
              </label>

              <select
                value={
                  isAvailable
                    ? "Available"
                    : "Unavailable"
                }
                onChange={(e) =>
                  setIsAvailable(
                    e.target.value === "Available"
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
              >
                <option value="Available">
                  Available
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>
              </select>
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Write a short description..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
              />
            </div>
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="mt-8 flex gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Item"
                : "Save Item"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LIST VIEW
  // ============================================================

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Menu Items
          </h2>

          <p className="mt-2 text-gray-600">
            Manage restaurant food, drinks and other items
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          + Add Menu Item
        </button>
      </div>

      {/* ================= SEARCH & FILTER ================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {/* SEARCH */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search item or category..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* AVAILABILITY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Availability
            </label>

            <select
              value={filterAvailability}
              onChange={(e) =>
                setFilterAvailability(
                  e.target.value as
                    | "All"
                    | "Available"
                    | "Unavailable"
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
            >
              <option value="All">All</option>

              <option value="Available">
                Available
              </option>

              <option value="Unavailable">
                Unavailable
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Menu Items
          </h3>

          <span className="text-sm text-gray-500">
            {filteredItems.length} item
            {filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Item
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Category
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Preparation
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Price
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading menu items...
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200"
                  >
                    {/* ITEM */}

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.name}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {item.description || "—"}
                        </p>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-6 py-4 text-gray-700">
                      {item.category?.name || "Unknown"}
                    </td>

                    {/* PREPARATION */}

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {item.foodType === "INSTANT"
                          ? "Instant"
                          : "Have to Cook"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td className="px-6 py-4 font-medium text-gray-800">
                      ৳{Number(item.price).toFixed(0)}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      {item.isAvailable ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                          Unavailable
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuItems;
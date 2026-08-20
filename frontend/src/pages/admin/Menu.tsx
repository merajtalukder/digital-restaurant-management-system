import { useEffect, useMemo, useState } from "react";

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

const Menu = () => {
  // =====================================================
  // DATA
  // =====================================================

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // CATEGORY
  // =====================================================

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    null
  );

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryStatus, setCategoryStatus] = useState(true);

  // =====================================================
  // MENU ITEM
  // =====================================================

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [foodType, setFoodType] = useState<"INSTANT" | "COOKED">("INSTANT");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data: Category[] = await response.json();

      setCategories(data);

      if (data.length > 0 && selectedCategory === null) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load categories.");
    }
  };

  // =====================================================
  // FETCH MENU ITEMS
  // =====================================================

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/menu-items`);

      if (!response.ok) {
        throw new Error("Failed to load menu items");
      }

      const data: MenuItem[] = await response.json();

      setMenuItems(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load menu items.");
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  // =====================================================
  // FILTERED ITEMS
  // =====================================================

  const filteredItems = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return menuItems.filter((item) => {
      const belongsToCategory =
        selectedCategory === null ||
        item.categoryId === selectedCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(searchText) ||
        (item.description || "").toLowerCase().includes(searchText);

      return belongsToCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, search]);

  // =====================================================
  // CATEGORY FORM RESET
  // =====================================================

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryStatus(true);
  };

  // =====================================================
  // ITEM FORM RESET
  // =====================================================

  const resetItemForm = () => {
    setShowItemForm(false);
    setEditingItemId(null);

    setItemName("");
    setItemCategoryId(
      selectedCategory ? String(selectedCategory) : ""
    );
    setFoodType("INSTANT");
    setPrice("");
    setDescription("");
    setIsAvailable(true);
  };

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const openAddCategory = () => {
    resetCategoryForm();

    setShowCategoryForm(true);
  };

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);

    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryStatus(category.status);

    setShowCategoryForm(true);
  };

  // =====================================================
  // SAVE CATEGORY
  // =====================================================

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Please enter category name.");
      return;
    }

    try {
      const categoryData = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || null,
        status: categoryStatus,
      };

      let response;

      if (editingCategoryId !== null) {
        response = await fetch(
          `${API_URL}/categories/${editingCategoryId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      await fetchCategories();

      resetCategoryForm();

      alert(
        editingCategoryId !== null
          ? "Category updated successfully."
          : "Category added successfully."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save category.");
    }
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const handleDeleteCategory = async (id: number) => {
    const categoryItems = menuItems.filter(
      (item) => item.categoryId === id
    );

    if (categoryItems.length > 0) {
      alert(
        "This category contains menu items. Please remove or move the items first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      if (selectedCategory === id) {
        setSelectedCategory(
          categories.find((category) => category.id !== id)?.id ||
            null
        );
      }

      await fetchCategories();

      alert("Category deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete category.");
    }
  };

  // =====================================================
  // OPEN ADD ITEM
  // =====================================================

  const openAddItem = () => {
    if (categories.length === 0) {
      alert("Please create a category first.");
      return;
    }

    resetItemForm();

    setItemCategoryId(
      selectedCategory
        ? String(selectedCategory)
        : String(categories[0].id)
    );

    setShowItemForm(true);
  };

  // =====================================================
  // EDIT ITEM
  // =====================================================

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);

    setItemName(item.name);
    setItemCategoryId(String(item.categoryId));
    setFoodType(item.foodType);
    setPrice(String(item.price));
    setDescription(item.description || "");
    setIsAvailable(item.isAvailable);

    setShowItemForm(true);
  };

  // =====================================================
  // SAVE ITEM
  // =====================================================

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      alert("Please enter food name.");
      return;
    }

    if (!itemCategoryId) {
      alert("Please select a category.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const itemData = {
        name: itemName.trim(),
        description: description.trim() || null,
        price: Number(price),
        foodType,
        categoryId: Number(itemCategoryId),
        isAvailable,
      };

      let response;

      if (editingItemId !== null) {
        response = await fetch(
          `${API_URL}/menu-items/${editingItemId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/menu-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save menu item");
      }

      await fetchMenuItems();

      const newCategory = Number(itemCategoryId);

      setSelectedCategory(newCategory);

      resetItemForm();

      alert(
        editingItemId !== null
          ? "Menu item updated successfully."
          : "Menu item added successfully."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save menu item.");
    }
  };

  // =====================================================
  // DELETE ITEM
  // =====================================================

  const handleDeleteItem = async (id: number) => {
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

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(
        `${API_URL}/menu-items/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAvailable: !item.isAvailable,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      setMenuItems((previous) =>
        previous.map((menuItem) =>
          menuItem.id === item.id
            ? {
                ...menuItem,
                isAvailable: !menuItem.isAvailable,
              }
            : menuItem
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update availability.");
    }
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const categoryItemCount = (categoryId: number) => {
    return menuItems.filter(
      (item) => item.categoryId === categoryId
    ).length;
  };

  const availableCount = filteredItems.filter(
    (item) => item.isAvailable
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Menu Management
          </h2>

          <p className="mt-2 text-gray-500">
            Manage your restaurant categories and food items
            from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={openAddCategory}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            + Category
          </button>

          <button
            type="button"
            onClick={openAddItem}
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + Add Food
          </button>

        </div>
      </div>

      {/* =================================================
          TOP STATS
      ================================================= */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Categories
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Food Items
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {menuItems.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Available
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {menuItems.filter((item) => item.isAvailable).length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Unavailable
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {menuItems.filter((item) => !item.isAvailable).length}
          </p>
        </div>

      </div>

      {/* =================================================
          CATEGORY FORM
      ================================================= */}

      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategoryId !== null
                    ? "Edit Category"
                    : "Add Category"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create a category for your restaurant menu.
                </p>
              </div>

              <button
                type="button"
                onClick={resetCategoryForm}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  placeholder="e.g. Burger"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  value={categoryDescription}
                  onChange={(e) =>
                    setCategoryDescription(e.target.value)
                  }
                  placeholder="Short category description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

                <div>
                  <p className="font-semibold text-gray-800">
                    Category Active
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Show this category in the menu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCategoryStatus(!categoryStatus)
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    categoryStatus
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      categoryStatus
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={resetCategoryForm}
                className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCategory}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {editingCategoryId !== null
                  ? "Update Category"
                  : "Save Category"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          ITEM FORM
      ================================================= */}

      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItemId !== null
                    ? "Edit Food Item"
                    : "Add Food Item"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add food details to your restaurant menu.
                </p>
              </div>

              <button
                type="button"
                onClick={resetItemForm}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Food Name
                </label>

                <input
                  type="text"
                  value={itemName}
                  onChange={(e) =>
                    setItemName(e.target.value)
                  }
                  placeholder="e.g. Chicken Burger"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <select
                  value={itemCategoryId}
                  onChange={(e) =>
                    setItemCategoryId(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
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

              {/* PRICE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Price (৳)
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="250"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* FOOD TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
                >
                  <option value="INSTANT">
                    Instant
                  </option>

                  <option value="COOKED">
                    Have to Cook
                  </option>
                </select>
              </div>

              {/* AVAILABILITY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
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

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Write a short description..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-900"
                />

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={resetItemForm}
                className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveItem}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {editingItemId !== null
                  ? "Update Food"
                  : "Save Food"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          MAIN MENU
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* =================================================
            CATEGORY SIDEBAR
        ================================================= */}

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="font-bold text-gray-900">
                Categories
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {categories.length} categories
              </p>
            </div>

            <button
              type="button"
              onClick={openAddCategory}
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              +
            </button>

          </div>

          <div className="space-y-2">

            {categories.map((category) => {

              const active =
                selectedCategory === category.id;

              return (
                <div
                  key={category.id}
                  className={`group flex items-center gap-2 rounded-xl p-2 transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearch("");
                    }}
                    className="flex min-w-0 flex-1 items-center justify-between px-2 py-2 text-left"
                  >

                    <div className="min-w-0">

                      <p
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {category.name}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          active
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {categoryItemCount(category.id)} items
                      </p>

                    </div>

                    <span
                      className={`ml-2 text-xs ${
                        active
                          ? "text-gray-300"
                          : "text-gray-400"
                      }`}
                    >
                      →
                    </span>

                  </button>

                  <div
                    className={`hidden gap-1 group-hover:flex ${
                      active
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleEditCategory(category)
                      }
                      className="rounded-md p-2 hover:bg-black/10"
                      title="Edit category"
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCategory(category.id)
                      }
                      className="rounded-md p-2 hover:bg-red-100 hover:text-red-600"
                      title="Delete category"
                    >
                      🗑
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">

              <p className="text-sm font-medium text-gray-700">
                No categories yet
              </p>

              <button
                type="button"
                onClick={openAddCategory}
                className="mt-3 text-sm font-semibold text-gray-900 underline"
              >
                Create category
              </button>

            </div>
          )}

        </div>

        {/* =================================================
            FOOD SECTION
        ================================================= */}

        <div className="min-w-0">

          {/* FOOD HEADER */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedCategoryData?.name ||
                      "All Menu Items"}
                  </h3>

                  {selectedCategoryData && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedCategoryData.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedCategoryData.status
                        ? "Active"
                        : "Inactive"}
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedCategoryData?.description ||
                    "Manage food items in this category."}
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-900">
                    {availableCount}
                  </span>{" "}
                  available
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-900">
                    {filteredItems.length}
                  </span>{" "}
                  items
                </div>

              </div>

            </div>

            {/* SEARCH */}

            <div className="mt-5">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search food in this category..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-gray-900 focus:bg-white"
              />

            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

              <p className="mt-4 text-sm text-gray-500">
                Loading menu...
              </p>

            </div>
          ) : filteredItems.length === 0 ? (

            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                🍽️
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No food items found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Add food items to this category and they
                will appear here.
              </p>

              <button
                type="button"
                onClick={openAddItem}
                className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + Add Food
              </button>

            </div>

          ) : (

            /* FOOD CARDS */

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {filteredItems.map((item) => (

                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* CARD TOP */}

                  <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">

                    <span className="text-5xl">
                      🍽️
                    </span>

                    <div className="absolute right-3 top-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h4 className="truncate text-lg font-bold text-gray-900">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {item.foodType === "INSTANT"
                            ? "Instant"
                            : "Have to Cook"}
                        </p>

                      </div>

                      <p className="whitespace-nowrap text-lg font-bold text-gray-900">
                        ৳{Number(item.price).toFixed(0)}
                      </p>

                    </div>

                    <p className="mt-3 min-h-[40px] text-sm leading-5 text-gray-500">
                      {item.description ||
                        "No description available."}
                    </p>

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          toggleAvailability(item)
                        }
                        className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                          item.isAvailable
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditItem(item)
                        }
                        className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteItem(item.id)
                        }
                        className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
      </div>
    </div>
  );
};

export default Menu;
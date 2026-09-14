import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  ArrowLeft,
  Search,
  Pencil,
  Trash2,
  Utensils,
  Zap,
  ChefHat,
  Check,
  X,
} from "lucide-react";

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

type MenuLevel = "TYPE" | "CATEGORY" | "ITEMS";
type FoodType = "INSTANT" | "COOKED";

const API_URL = "http://localhost:3000";

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuLevel, setMenuLevel] = useState<MenuLevel>("TYPE");
  const [selectedFoodType, setSelectedFoodType] =
    useState<FoodType | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryStatus, setCategoryStatus] = useState(true);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] =
    useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [foodType, setFoodType] = useState<FoodType>("INSTANT");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch (error) {
      console.error(error);
      alert("Failed to load categories.");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu-items`);
      if (!res.ok) throw new Error();
      setMenuItems(await res.json());
    } catch (error) {
      console.error(error);
      alert("Failed to load menu items.");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  const typeCategories = useMemo(() => {
    if (!selectedFoodType) return [];

    const ids = new Set(
      menuItems
        .filter((item) => item.foodType === selectedFoodType)
        .map((item) => item.categoryId)
    );

    return categories.filter((category) => ids.has(category.id));
  }, [categories, menuItems, selectedFoodType]);

  const filteredItems = useMemo(() => {
    const text = search.toLowerCase().trim();

    return menuItems.filter((item) => {
      const typeMatch =
        !selectedFoodType || item.foodType === selectedFoodType;

      const categoryMatch =
        selectedCategory === null ||
        item.categoryId === selectedCategory;

      const searchMatch =
        item.name.toLowerCase().includes(text) ||
        (item.description || "").toLowerCase().includes(text);

      return typeMatch && categoryMatch && searchMatch;
    });
  }, [menuItems, selectedFoodType, selectedCategory, search]);

  const categoryItemCount = (id: number) =>
    menuItems.filter((item) => item.categoryId === id).length;

  const typeItemCount = (type: FoodType) =>
    menuItems.filter((item) => item.foodType === type).length;

  const availableCount = filteredItems.filter(
    (item) => item.isAvailable
  ).length;

  const goToTypes = () => {
    setMenuLevel("TYPE");
    setSelectedFoodType(null);
    setSelectedCategory(null);
    setSearch("");
  };

  const goToCategories = () => {
    setMenuLevel("CATEGORY");
    setSelectedCategory(null);
    setSearch("");
  };

  const handleBack = () =>
    menuLevel === "ITEMS" ? goToCategories() : goToTypes();

  const openFoodType = (type: FoodType) => {
    setSelectedFoodType(type);
    setSelectedCategory(null);
    setSearch("");
    setMenuLevel("CATEGORY");
  };

  const openCategory = (id: number) => {
    setSelectedCategory(id);
    setSearch("");
    setMenuLevel("ITEMS");
  };

  /* Category */

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryStatus(true);
  };

  const openAddCategory = () => {
    resetCategoryForm();
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryStatus(category.status);
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Please enter category name.");
      return;
    }

    try {
      const data = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || null,
        status: categoryStatus,
      };

      const url =
        editingCategoryId !== null
          ? `${API_URL}/categories/${editingCategoryId}`
          : `${API_URL}/categories`;

      const res = await fetch(url, {
        method: editingCategoryId !== null ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      await fetchCategories();
      const editing = editingCategoryId !== null;
      resetCategoryForm();

      alert(
        editing
          ? "Category updated successfully."
          : "Category added successfully."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (menuItems.some((item) => item.categoryId === id)) {
      alert(
        "This category contains menu items. Please remove or move the items first."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await fetchCategories();

      if (selectedCategory === id) goToCategories();

      alert("Category deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete category.");
    }
  };

  /* Food Item */

  const resetItemForm = () => {
    setShowItemForm(false);
    setEditingItemId(null);
    setItemName("");
    setItemCategoryId("");
    setFoodType(selectedFoodType || "INSTANT");
    setPrice("");
    setDescription("");
    setIsAvailable(true);
  };

  const openAddItem = () => {
    if (!categories.length) {
      alert("Please create a category first.");
      return;
    }

    setEditingItemId(null);
    setItemName("");
    setItemCategoryId(
      selectedCategory ? String(selectedCategory) : ""
    );
    setFoodType(selectedFoodType || "INSTANT");
    setPrice("");
    setDescription("");
    setIsAvailable(true);
    setShowItemForm(true);
  };

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
      const data = {
        name: itemName.trim(),
        description: description.trim() || null,
        price: Number(price),
        foodType,
        categoryId: Number(itemCategoryId),
        isAvailable,
      };

      const url =
        editingItemId !== null
          ? `${API_URL}/menu-items/${editingItemId}`
          : `${API_URL}/menu-items`;

      const res = await fetch(url, {
        method: editingItemId !== null ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      await fetchMenuItems();

      setSelectedFoodType(foodType);
      setSelectedCategory(Number(itemCategoryId));
      setMenuLevel("ITEMS");

      const editing = editingItemId !== null;
      resetItemForm();

      alert(
        editing
          ? "Menu item updated successfully."
          : "Menu item added successfully."
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save menu item.");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this menu item?"))
      return;

    try {
      const res = await fetch(`${API_URL}/menu-items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await fetchMenuItems();
      alert("Menu item deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete menu item.");
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`${API_URL}/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
        }),
      });

      if (!res.ok) throw new Error();

      setMenuItems((items) =>
        items.map((x) =>
          x.id === item.id
            ? { ...x, isAvailable: !x.isAvailable }
            : x
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update availability.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Menu Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage food, categories and availability.
            </p>
          </div>

          <button
            onClick={openAddItem}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
          >
            <Plus size={17} />
            Add Food
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Categories", categories.length, "text-violet-600"],
            ["Food Items", menuItems.length, "text-cyan-600"],
            [
              "Available",
              menuItems.filter((x) => x.isAvailable).length,
              "text-emerald-600",
            ],
            [
              "Unavailable",
              menuItems.filter((x) => !x.isAvailable).length,
              "text-red-500",
            ],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold text-slate-400">
                {label}
              </p>
              <p className={`mt-1 text-2xl font-extrabold ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Modals */}
        {showCategoryForm && (
          <Modal
            title={
              editingCategoryId !== null
                ? "Edit Category"
                : "Add Category"
            }
            onClose={resetCategoryForm}
          >
            <div className="space-y-4">
              <Field label="Category Name">
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Burger"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={categoryDescription}
                  onChange={(e) =>
                    setCategoryDescription(e.target.value)
                  }
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Short description..."
                />
              </Field>

              <Toggle
                label="Category Active"
                checked={categoryStatus}
                onChange={() =>
                  setCategoryStatus(!categoryStatus)
                }
              />

              <FormButtons
                cancel={resetCategoryForm}
                save={handleSaveCategory}
                text={
                  editingCategoryId !== null
                    ? "Update Category"
                    : "Save Category"
                }
              />
            </div>
          </Modal>
        )}

        {showItemForm && (
          <Modal
            title={
              editingItemId !== null
                ? "Edit Food Item"
                : "Add Food Item"
            }
            onClose={resetItemForm}
            wide
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Food Name">
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Chicken Burger"
                  className={inputClass}
                />
              </Field>

              <Field label="Category">
                <select
                  value={itemCategoryId}
                  onChange={(e) =>
                    setItemCategoryId(e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Price (৳)">
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250"
                  className={inputClass}
                />
              </Field>

              <Field label="Preparation Type">
                <select
                  value={foodType}
                  onChange={(e) =>
                    setFoodType(e.target.value as FoodType)
                  }
                  className={inputClass}
                >
                  <option value="INSTANT">Instant</option>
                  <option value="COOKED">Have to Cook</option>
                </select>
              </Field>

              <Field label="Availability">
                <select
                  value={isAvailable ? "Available" : "Unavailable"}
                  onChange={(e) =>
                    setIsAvailable(e.target.value === "Available")
                  }
                  className={inputClass}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </Field>

              <Field label="Description" full>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Write a short description..."
                />
              </Field>

              <div className="sm:col-span-2">
                <FormButtons
                  cancel={resetItemForm}
                  save={handleSaveItem}
                  text={
                    editingItemId !== null
                      ? "Update Food"
                      : "Save Food"
                  }
                />
              </div>
            </div>
          </Modal>
        )}

        {/* Menu */}
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          {/* Navigation */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {menuLevel !== "TYPE" && (
              <button
                onClick={handleBack}
                className="mr-1 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}

            <button
              onClick={goToTypes}
              className={`text-xs font-bold ${
                menuLevel === "TYPE"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              Menu
            </button>

            {selectedFoodType && (
              <>
                <span className="text-slate-300">/</span>
                <button
                  onClick={goToCategories}
                  className={`text-xs font-bold ${
                    menuLevel === "CATEGORY"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {selectedFoodType === "INSTANT"
                    ? "Instant"
                    : "Have to Cook"}
                </button>
              </>
            )}

            {selectedCategoryData && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-700">
                  {selectedCategoryData.name}
                </span>
              </>
            )}
          </div>

          {/* Types */}
          {menuLevel === "TYPE" && (
            <>
              <SectionTitle
                title="Choose Preparation Type"
                text="Select how the food is prepared."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <TypeCard
                  title="Instant"
                  text="Ready-to-serve food that doesn't require kitchen preparation."
                  count={typeItemCount("INSTANT")}
                  icon={<Zap size={27} />}
                  onClick={() => openFoodType("INSTANT")}
                  gradient="from-emerald-50 to-cyan-50"
                  iconStyle="bg-emerald-100 text-emerald-600"
                />

                <TypeCard
                  title="Have to Cook"
                  text="Food that needs kitchen preparation before serving."
                  count={typeItemCount("COOKED")}
                  icon={<ChefHat size={27} />}
                  onClick={() => openFoodType("COOKED")}
                  gradient="from-violet-50 to-fuchsia-50"
                  iconStyle="bg-violet-100 text-violet-600"
                />
              </div>
            </>
          )}

          {/* Categories */}
          {menuLevel === "CATEGORY" && (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <SectionTitle
                  title={
                    selectedFoodType === "INSTANT"
                      ? "Instant Categories"
                      : "Cooked Food Categories"
                  }
                  text="Choose a category to see its food items."
                />

                <button
                  onClick={openAddCategory}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Plus size={14} />
                  Category
                </button>
              </div>

              {typeCategories.length === 0 ? (
                <Empty
                  icon={<Utensils size={27} />}
                  title="No categories found"
                  text="Create a category or add food items with this preparation type."
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {typeCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => openCategory(category.id)}
                      className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                        {getCategoryEmoji(category.name)}
                      </div>

                      <h3 className="mt-3 truncate text-sm font-extrabold text-slate-800">
                        {category.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 min-h-[32px] text-[11px] leading-4 text-slate-400">
                        {category.description ||
                          "Explore food items in this category."}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                          {categoryItemCount(category.id)} items
                        </span>

                        <span
                          className={`text-[9px] font-bold ${
                            category.status
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {category.status ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex gap-1.5 border-t border-slate-200 pt-3"
                      >
                        <button
                          onClick={() =>
                            handleEditCategory(category)
                          }
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id)
                          }
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-[10px] font-bold text-red-500 hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Items */}
          {menuLevel === "ITEMS" && (
            <>
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-800">
                        {selectedCategoryData?.name}
                      </h2>

                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                          selectedCategoryData?.status
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {selectedCategoryData?.status
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {selectedCategoryData?.description ||
                        "Food items in this category."}
                    </p>
                  </div>

                  <button
                    onClick={openAddItem}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <Plus size={14} />
                    Add Food
                  </button>
                </div>

                <div className="relative mt-3">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${
                      selectedCategoryData?.name || "food"
                    }...`}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div className="mb-4 flex gap-2">
                <span className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-600">
                  {availableCount} Available
                </span>

                <span className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500">
                  {filteredItems.length} Items
                </span>
              </div>

              {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Loading menu...
                </div>
              ) : filteredItems.length === 0 ? (
                <Empty
                  icon={<Utensils size={27} />}
                  title="No food items found"
                  text="Try another search or add a new food item."
                  action={
                    <button
                      onClick={openAddItem}
                      className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                    >
                      + Add Food
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                        <Utensils
                          size={42}
                          className="text-slate-300"
                        />

                        <span
                          className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[9px] font-bold ${
                            item.isAvailable
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>

                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-extrabold text-slate-800">
                              {item.name}
                            </h3>

                            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                              {item.foodType === "INSTANT"
                                ? "Instant"
                                : "Have to Cook"}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-extrabold text-emerald-600">
                            ৳{Number(item.price).toFixed(0)}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 min-h-[30px] text-[11px] leading-4 text-slate-400">
                          {item.description ||
                            "No description available."}
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() =>
                              toggleAvailability(item)
                            }
                            className={`rounded-lg py-2 text-[9px] font-bold ${
                              item.isAvailable
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {item.isAvailable ? "ON" : "OFF"}
                          </button>

                          <button
                            onClick={() => handleEditItem(item)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 py-2 text-[9px] font-bold text-slate-600 hover:bg-slate-200"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteItem(item.id)
                            }
                            className="flex items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-[9px] font-bold text-red-500 hover:bg-red-100"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------- Small UI Components ---------- */

const Modal = ({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
    <div
      className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ${
        wide ? "max-w-2xl" : "max-w-md"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-800">
          {title}
        </h2>

        <button
          onClick={onClose}
          className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
        >
          <X size={16} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

const Field = ({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
      {label}
    </label>
    {children}
  </div>
);

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3"
  >
    <span className="text-xs font-bold text-slate-700">{label}</span>

    <span
      className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </span>
  </button>
);

const FormButtons = ({
  cancel,
  save,
  text,
}: {
  cancel: () => void;
  save: () => void;
  text: string;
}) => (
  <div className="flex justify-end gap-2 pt-1">
    <button
      onClick={cancel}
      className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
    >
      Cancel
    </button>

    <button
      onClick={save}
      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white"
    >
      <Check size={14} />
      {text}
    </button>
  </div>
);

const SectionTitle = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <div className="mb-4">
    <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
    <p className="mt-1 text-[11px] text-slate-400">{text}</p>
  </div>
);

const TypeCard = ({
  title,
  text,
  count,
  icon,
  onClick,
  gradient,
  iconStyle,
}: {
  title: string;
  text: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
  gradient: string;
  iconStyle: string;
}) => (
  <button
    onClick={onClick}
    className={`group rounded-2xl border border-slate-100 bg-gradient-to-br ${gradient} p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
  >
    <div className="flex items-center justify-between">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyle}`}
      >
        {icon}
      </div>

      <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500">
        {count} Items
      </span>
    </div>

    <h3 className="mt-4 text-lg font-extrabold text-slate-800">
      {title}
    </h3>

    <p className="mt-1.5 max-w-md text-[11px] leading-5 text-slate-500">
      {text}
    </p>

    <p className="mt-3 text-[11px] font-bold text-emerald-600">
      View Categories →
    </p>
  </button>
);

const Empty = ({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
      {icon}
    </div>

    <h3 className="mt-3 text-sm font-extrabold text-slate-700">
      {title}
    </h3>

    <p className="mx-auto mt-1 max-w-sm text-[11px] text-slate-400">
      {text}
    </p>

    {action}
  </div>
);

const getCategoryEmoji = (name: string) => {
  const value = name.toLowerCase();

  if (value.includes("burger")) return "🍔";
  if (value.includes("pizza")) return "🍕";
  if (value.includes("drink")) return "🥤";
  if (value.includes("rice")) return "🍚";
  if (value.includes("biryani")) return "🍛";
  if (value.includes("snack")) return "🍟";

  return "🍽️";
};

export default Menu;
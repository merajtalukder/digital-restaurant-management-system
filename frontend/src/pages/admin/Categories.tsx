import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  description?: string | null;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "http://localhost:3000/categories";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);

  // =========================
  // GET ALL CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  // Load categories when page opens
  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // ADD / UPDATE CATEGORY
  // =========================

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    try {
      // =========================
      // UPDATE
      // =========================

      if (editingId !== null) {
        const response = await fetch(
          `${API_URL}/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: categoryName.trim(),
               description: description.trim() || null,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update category");
        }

        alert("Category updated successfully.");
      }

      // =========================
      // ADD
      // =========================

      else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: categoryName.trim(),
             description: description.trim() || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }

        alert("Category added successfully.");
      }

      resetForm();

      // Refresh data from database
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Something went wrong.");
    }
  };

  // =========================
  // EDIT CATEGORY
  // =========================

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setDescription(category.description || "");
    setShowForm(true);
  };

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      alert("Category deleted successfully.");

      // Refresh data from database
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(
        "Failed to delete category. It may be connected to menu items."
      );
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCategoryName("");
    setDescription("");
  };

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Categories
          </h2>

          <p className="mt-2 text-gray-600">
            Manage food, drinks and other menu categories
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          {showForm ? "Close" : "+ Add Category"}
        </button>
      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-semibold text-gray-800">
            {editingId !== null
              ? "Edit Category"
              : "Add New Category"}
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Category Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Name
              </label>

              <input
                type="text"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                placeholder="e.g. Fast Food"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {/* Description */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="e.g. Burger, Pizza and Snacks"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>

          {/* Form Buttons */}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSaveCategory}
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              {editingId !== null
                ? "Update Category"
                : "Save Category"}
            </button>

            {editingId !== null && (
              <button
                onClick={resetForm}
                className="rounded-lg bg-gray-100 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= CATEGORY TABLE ================= */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Table Header */}

        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">
            All Categories
          </h3>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Description
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
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-gray-200"
                  >
                    {/* ID */}

                    <td className="px-6 py-4 text-gray-600">
                      {category.id}
                    </td>

                    {/* Category Name */}

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {category.name}
                    </td>

                    {/* Description */}

                    <td className="px-6 py-4 text-gray-600">
                      {category.description || "—"}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">
                      {category.status ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                          Edit
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category.id)
                          }
                          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
import { useState } from "react";

const menuItems = [
  { id: 1, name: "Chicken Burger", price: 350, category: "Burger" },
  { id: 2, name: "Beef Burger", price: 420, category: "Burger" },
  { id: 3, name: "BBQ Pizza", price: 650, category: "Pizza" },
  { id: 4, name: "Fried Chicken", price: 280, category: "Chicken" },
  { id: 5, name: "French Fries", price: 180, category: "Snacks" },
  { id: 6, name: "Coke", price: 60, category: "Drinks" },
];

const categories = [
  "All",
  "Burger",
  "Pizza",
  "Chicken",
  "Snacks",
  "Drinks",
];

const TakeOrder = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<any[]>([]);

  const filteredMenu = menuItems.filter(
    (item) =>
      (selectedCategory === "All" ||
        item.category === selectedCategory) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (food: any) => {
    const existing = cart.find((item) => item.id === food.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...food,
          quantity: 1,
        },
      ]);
    }
  };

  const increase = (id: number) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrease = (id: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const vat = subtotal * 0.05;

  const total = subtotal + vat;

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* LEFT */}

      <div className="col-span-8 bg-white rounded-xl shadow p-6">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            Table 5
          </h1>

          <span className="text-gray-500">
            Walk-in Customer
          </span>

        </div>

        <div className="flex gap-4 mb-6">

          <input
            type="text"
            placeholder="Search Food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1"
          />

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }
            className="border rounded-lg px-4 py-2"
          >
            {categories.map((cat) => (
              <option key={cat}>
                {cat}
              </option>
            ))}
          </select>

        </div>

        <div className="grid grid-cols-2 gap-4">

          {filteredMenu.map((food) => (

            <div
              key={food.id}
              className="border rounded-xl p-4 hover:shadow"
            >

              <h2 className="font-semibold text-lg">
                {food.name}
              </h2>

              <p className="text-gray-500">
                {food.category}
              </p>

              <div className="flex justify-between items-center mt-4">

                <span className="font-bold text-xl">
                  ৳{food.price}
                </span>

                <button
                  onClick={() => addToCart(food)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT */}

      <div className="col-span-4 bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold mb-5">
          Current Order
        </h2>

        <div className="space-y-4">

          {cart.length === 0 && (
            <p className="text-gray-400">
              No items selected
            </p>
          )}

          {cart.map((item) => (

            <div
              key={item.id}
              className="border rounded-lg p-3"
            >

              <div className="flex justify-between">

                <h3 className="font-semibold">
                  {item.name}
                </h3>

                <span>
                  ৳{item.price * item.quantity}
                </span>

              </div>

              <div className="flex items-center gap-3 mt-3">

                <button
                  onClick={() => decrease(item.id)}
                  className="w-8 h-8 rounded bg-red-500 text-white"
                >
                  -
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() => increase(item.id)}
                  className="w-8 h-8 rounded bg-green-500 text-white"
                >
                  +
                </button>

              </div>

            </div>

          ))}

        </div>

        <hr className="my-6" />

        <div className="space-y-2">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>VAT (5%)</span>
            <span>৳{vat.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>৳{total.toFixed(2)}</span>
          </div>

        </div>

        <textarea
          rows={4}
          placeholder="Special Instructions..."
          className="border rounded-lg w-full mt-6 p-3"
        />

        <div className="grid grid-cols-2 gap-3 mt-6">

          <button
            className="bg-gray-300 rounded-lg py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            className="bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700"
          >
            Send Kitchen
          </button>

        </div>

      </div>

    </div>
  );
};

export default TakeOrder;
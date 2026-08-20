import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;

  totalAmount: number;
  cartItemCount: number;

  notification: string;
  showNotification: (message: string) => void;

  customerTableNumber: number | null;
  setCustomerTableNumber: (tableNumber: number | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  // =========================
  // CUSTOMER TABLE
  // =========================

  const [customerTableNumber, setCustomerTableNumberState] =
    useState<number | null>(() => {

      const savedTable =
        localStorage.getItem("customerTableNumber");

      return savedTable
        ? Number(savedTable)
        : null;
    });

  // =========================
  // CART
  // =========================

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [notification, setNotification] =
    useState("");

  // =========================
  // CART LOADING STATE
  // =========================

  const [cartLoaded, setCartLoaded] =
    useState(false);

  // =========================
  // GET CART KEY
  // =========================

  const getCartKey = (
    tableNumber: number | null
  ) => {

    if (!tableNumber) {
      return "restaurant_cart_no_table";
    }

    return `restaurant_cart_table_${tableNumber}`;
  };

  // =========================
  // LOAD CART WHEN TABLE CHANGES
  // =========================

  useEffect(() => {

    setCartLoaded(false);

    const cartKey =
      getCartKey(customerTableNumber);

    const savedCart =
      localStorage.getItem(cartKey);

    try {

      const parsedCart =
        savedCart
          ? JSON.parse(savedCart)
          : [];

      setCartItems(
        Array.isArray(parsedCart)
          ? parsedCart
          : []
      );

    } catch {

      setCartItems([]);

    }

    // Important:
    // Wait until old cart is loaded
    // before saving anything.

    setCartLoaded(true);

  }, [customerTableNumber]);

  // =========================
  // SAVE CART
  // =========================

  useEffect(() => {

    // Don't save before cart has loaded
    if (!cartLoaded) {
      return;
    }

    const cartKey =
      getCartKey(customerTableNumber);

    localStorage.setItem(
      cartKey,
      JSON.stringify(cartItems)
    );

  }, [
    cartItems,
    customerTableNumber,
    cartLoaded,
  ]);

  // =========================
  // SET CUSTOMER TABLE
  // =========================

  const setCustomerTableNumber = (
    tableNumber: number | null
  ) => {

    setCustomerTableNumberState(
      tableNumber
    );

    if (tableNumber !== null) {

      localStorage.setItem(
        "customerTableNumber",
        String(tableNumber)
      );

    } else {

      localStorage.removeItem(
        "customerTableNumber"
      );

    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (item: CartItem) => {

    setCartItems((currentItems) => {

      const existingItem =
        currentItems.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existingItem) {

        return currentItems.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    showNotification(
      `${item.name} added to cart`
    );
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = (id: number) => {

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (id: number) => {

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const decreaseQuantity = (id: number) => {

    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id
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

  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {

    setCartItems([]);

    const cartKey =
      getCartKey(customerTableNumber);

    localStorage.removeItem(cartKey);
  };

  // =========================
  // TOTAL
  // =========================

  const totalAmount =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );

  // =========================
  // CART COUNT
  // =========================

  const cartItemCount =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // =========================
  // NOTIFICATION
  // =========================

  const showNotification = (
    message: string
  ) => {

    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  return (
    <CartContext.Provider
      value={{

        cartItems,

        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,

        totalAmount,
        cartItemCount,

        notification,
        showNotification,

        customerTableNumber,
        setCustomerTableNumber,

      }}
    >

      {children}

      {/* =========================
          NOTIFICATION
      ========================= */}

      {notification && (

        <div className="fixed top-5 right-5 z-[9999] bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3">

          <span className="text-lg">
            ✓
          </span>

          <span className="font-medium">
            {notification}
          </span>

        </div>

      )}

    </CartContext.Provider>
  );
};

// =========================
// USE CART
// =========================

export const useCart = () => {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
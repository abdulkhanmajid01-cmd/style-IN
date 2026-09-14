"use client";
// "use client" zaroori hai — yeh Context Provider hai jo useState/useEffect
// use karta hai, aur cart ke sath interact karne wale sab components
// (Header, ProductCard, CartDrawer) client-side par render hote hain.

import { createContext, useContext, useState, useEffect } from "react";

// Context banaya — yeh "container" hai jisme cart ka data store hoga.
// Default value null di hai taake agar koi component Provider ke bahar
// useCart() call kare to hume turant pata chal jaye (error throw karenge neeche).
const CartContext = createContext(null);

const STORAGE_KEY = "style-in-cart"; // localStorage mein isi naam se cart save hoga

export function CartProvider({ children }) {
  // items: cart ke andar products ka array — har item: { id, slug, name, price, quantity }
  const [items, setItems] = useState([]);

  // isCartOpen: cart drawer khula hai ya band — Header ka cart icon isko toggle karega
  const [isCartOpen, setIsCartOpen] = useState(false);

  // isHydrated: batata hai ke localStorage se data load ho chuka hai ya nahi.
  // Zaroori hai kyunke server par localStorage exist nahi karta — agar isko
  // check na karein to "hydration mismatch" error aa sakta hai.
  const [isHydrated, setIsHydrated] = useState(false);

  // Component mount hone par (sirf ek baar) localStorage se purana cart uthate hain
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // Agar saved data corrupt/invalid ho to chup chap ignore kar dete hain
        // (cart khali rahega, app crash nahi hogi)
      }
    }
    setIsHydrated(true);
  }, []);

  // Jab bhi "items" badlein (add/remove/update), naya cart localStorage mein save karo.
  // isHydrated check zaroori hai — warna yeh effect pehli baar khali array ko
  // save kar dega aur purana saved cart overwrite ho jayega, mount hone se pehle hi.
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // Product ko cart mein add karta hai. Agar wahi product (same id) already
  // cart mein hai, to uski quantity +1 badha dete hain — naya entry nahi banate.
  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true); // add karte hi drawer khud khul jaye — user ko confirm feel ho
  }

  // Cart se ek item poora hata dena (quantity chahe kuch bhi ho)
  function removeFromCart(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Quantity update karna (+/− buttons se). Agar quantity 0 ya kam ho jaye
  // to item khud-ba-khud cart se remove ho jata hai.
  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  // Checkout complete hone ke baad poora cart khali karne ke liye
  function clearCart() {
    setItems([]);
  }

  // Derived values — inko baar baar calculate karne ki zaroorat nahi,
  // jo bhi component inhe use karega usko seedha mil jayenge.
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook — koi bhi component "const cart = useCart()" likh kar
// cart ka data/functions use kar sakega, bina Context API ki details jaane.
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Yeh error tab aayega agar koi component <CartProvider> ke bahar
    // useCart() call kare — jaldi bug pakarne mein madad karta hai.
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}

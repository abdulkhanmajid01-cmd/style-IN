"use client";
// "use client" zaroori hai — useCart() hook, onClick handlers, aur
// Framer Motion animations sab client-side features hain.

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Button from "./ui/Button";
import PriceTag from "./ui/PriceTag";

export default function CartDrawer() {
  // Context se woh sab kuch le rahe hain jo drawer ko chahiye
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, totalPrice } =
    useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop — drawer ke peeche ka dark overlay. Click karne se
              drawer band ho jata hai (bahar click = close, common UX pattern) */}
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Asal drawer panel — right se slide-in hoga */}
          <motion.div
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="cart-drawer-header">
              <h3>Your Bag ({items.length})</h3>
              <button className="icon-btn" aria-label="Close cart" onClick={closeCart}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            {/* Khali cart ka empty state */}
            {items.length === 0 ? (
              <div className="cart-empty">
                <p>Your bag is empty.</p>
                <Button href="/shop" variant="outline" onClick={closeCart}>
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <PriceTag price={item.price} />
                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="cart-item-controls">
                        {/* Quantity −/+ — updateQuantity khud handle karta hai
                            ke 0 par pahunchne se item remove ho jaye */}
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-subtotal">
                    <span>Subtotal</span>
                    <PriceTag price={totalPrice} size="lg" />
                  </div>
                  <Button href="/checkout" fullWidth onClick={closeCart}>
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

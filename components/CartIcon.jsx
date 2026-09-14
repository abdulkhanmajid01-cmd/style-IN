"use client";
// "use client" zaroori hai — yeh useCart() hook use karta hai (Context se
// data padhta hai) aur onClick se drawer toggle karta hai.

import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  // Context se sirf woh do cheezein le rahe hain jo humein chahiye:
  // totalItems (badge ka number) aur toggleCart (click handler)
  const { totalItems, toggleCart } = useCart();

  return (
    <button className="icon-btn cart-btn" aria-label="Cart" onClick={toggleCart}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>

      {/* Badge sirf tab dikhega jab cart khali na ho — is se zero waale
          badge se UI ganda nahi hoga */}
      {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
    </button>
  );
}

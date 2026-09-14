// PriceTag.jsx — yeh bhi Server Component hai (koi "use client" nahi),
// kyunke sirf numbers ko format karke dikhata hai, koi state/interactivity nahi.

// price: current/selling price (number, required)
// originalPrice: agar diya jaye to strikethrough ke sath dikhega + discount % calculate hoga
// size: "md" (default, product cards) | "lg" (checkout summary, product detail page)
export default function PriceTag({ price, originalPrice = null, size = "md" }) {
  // PKR format: "Rs. 4,290" — Intl.NumberFormat comma-separate karta hai (4290 → 4,290)
  // Yeh manually string banane se zyada reliable hai (bade numbers, edge cases sab handle ho jate hain)
  const formatPrice = (value) =>
    `Rs. ${new Intl.NumberFormat("en-PK").format(value)}`;

  // Discount % sirf tab calculate hoga jab originalPrice ho aur woh current price se zyada ho
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <div className={`price-row ${size === "lg" ? "price-row-lg" : ""}`}>
      {/* Current price — hamesha bold/dark dikhta hai */}
      <span className="price-now">{formatPrice(price)}</span>

      {/* Sirf tab dikhega jab discount ho */}
      {hasDiscount && (
        <>
          <span className="price-was">{formatPrice(originalPrice)}</span>
          <span className="price-off">−{discountPercent}%</span>
        </>
      )}
    </div>
  );
}

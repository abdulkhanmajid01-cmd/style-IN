"use client";
// "use client" chahiye kyunke useCart() hook aur "Add to Bag" ka onClick
// dono client-side features hain.

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Badge from "./ui/Badge";
import PriceTag from "./ui/PriceTag";
import Button from "./ui/Button";
import CategoryVisual from "./CategoryVisual";
import {
  getProductColors,
  getDisplayPrice,
  colorToHex,
  formatCategoryLabel,
  isProductSoldOut,
} from "@/lib/data/products";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const soldOut = isProductSoldOut(product); // sab variants ka stock 0 hai ya nahi
  const colors = getProductColors(product); // card ke neeche dots ke liye
  const { current, original } = getDisplayPrice(product); // sale semantics ek jagah

  function handleAddToBag() {
    // Cart mein sirf woh fields bhejte hain jo cart ko chahiye —
    // poora product object nahi (description jaisi cheezein cart mein
    // zaroori nahi hain, isse cart ka localStorage data bhi chhota rehta hai)
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: current, // hamesha discounted/current price
    });
  }

  return (
    <div className="product-card">
      {/* Poora visual+info area clickable hai (product detail page tak) */}
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <CategoryVisual id={product.id} category={product.category} image={product.image}>
          {/* Sold-out badge sab se pehle check hota hai — agar khatam hai to
              "New"/"Sale" badge se zyada zaroori info yehi hai */}
          {soldOut ? (
            <Badge variant="sold-out">Sold Out</Badge>
          ) : (
            product.badge && (
              <Badge variant={product.badge}>
                {product.badge === "sale" ? "Sale" : "New"}
              </Badge>
            )
          )}
        </CategoryVisual>

        <div className="product-info">
          <h4>{product.name}</h4>
          <div className="cat">{formatCategoryLabel(product.category)}</div>
          <PriceTag price={current} originalPrice={original} />
          {/* Price ke neeche chhote color dots (Outfitters style) — max 5
              dikhate hain, zyada colors hon to "+N" bata dete hain */}
          {colors.length > 0 && (
            <div className="product-color-dots">
              {colors.slice(0, 5).map((color) => (
                <span
                  key={color}
                  className="product-color-dot"
                  style={{ background: colorToHex(color) }}
                  title={color}
                />
              ))}
              {colors.length > 5 && (
                <span className="product-color-dot-more">+{colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Button Link ke BAHAR rakha hai (andar nahi) — kyunke button ko
          anchor tag ke andar nesting HTML mein invalid hai (button khud
          bhi ek interactive/clickable element hai, do interactive elements
          ek dusre ke andar nahi hone chahiye) */}
      <Button variant="outline" size="sm" fullWidth onClick={handleAddToBag} disabled={soldOut}>
        {soldOut ? "Sold Out" : "Add to Bag"}
      </Button>
    </div>
  );
}
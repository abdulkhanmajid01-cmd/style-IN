"use client";
// "use client" chahiye kyunke useCart() hook aur "Add to Bag" ka onClick
// dono client-side features hain.

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Badge from "./ui/Badge";
import PriceTag from "./ui/PriceTag";
import Button from "./ui/Button";
import CategoryVisual from "./CategoryVisual";
import { isProductSoldOut } from "@/lib/data/products";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const soldOut = isProductSoldOut(product); // sab variants ka stock 0 hai ya nahi

  function handleAddToBag() {
    // Cart mein sirf woh fields bhejte hain jo cart ko chahiye —
    // poora product object nahi (description jaisi cheezein cart mein
    // zaroori nahi hain, isse cart ka localStorage data bhi chhota rehta hai)
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
    });
  }

  return (
    <div className="product-card">
      {/* Poora visual+info area clickable hai (product detail page tak) */}
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <CategoryVisual id={product.id} category={product.category}>
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
          <div className="cat">{product.category === "bag" ? "Bags" : "Shoes"}</div>
          {/* salePrice field "original/was" price ki tarah use ho rahi hai —
              agar woh current price se zyada hai to PriceTag discount dikha dega */}
          <PriceTag price={product.price} originalPrice={product.salePrice} />
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

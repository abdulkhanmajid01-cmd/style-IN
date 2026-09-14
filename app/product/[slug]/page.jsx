"use client";
// "use client" zaroori hai — quantity/color/size selection (useState) aur
// "Add to Bag" (useCart) dono client-side interactivity hain.

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getProductColors,
  getProductSizes,
  getVariantStock,
  isProductSoldOut,
  isColorSoldOut,
} from "@/lib/data/products";
import { useCart } from "@/context/CartContext";
import CategoryVisual from "@/components/CategoryVisual";
import Badge from "@/components/ui/Badge";
import PriceTag from "@/components/ui/PriceTag";
import Button from "@/components/ui/Button";
import AccordionSection from "@/components/ui/AccordionSection";

// Color naam ko ek actual dikhne wale swatch color se map karte hain.
// Naya color agar list mein na ho to fallback grey dikhega (crash nahi hoga).
const COLOR_HEX = {
  Black: "#1a1a1a",
  White: "#f5f5f0",
  Tan: "#b08968",
  Brown: "#5c4033",
  Cream: "#f0e6d6",
  Grey: "#9a978f",
  Gold: "#c9a24b",
  Silver: "#c4c4c4",
  Navy: "#1e2a4a",
};
function colorToHex(name) {
  return COLOR_HEX[name] || "#bbb";
}

export default function ProductDetailPage({ params }) {
  const product = getProductBySlug(params.slug);

  // Agar slug se koi product na mile (galat/purana URL), Next.js ka
  // built-in 404 page dikhayenge — crash ya khali safa nahi
  if (!product) {
    notFound();
  }

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [variantError, setVariantError] = useState("");

  const soldOut = isProductSoldOut(product); // poora product hi khatam hai
  const colors = getProductColors(product);
  // Sizes sirf tab exist karti hain jab selectedColor chuna gaya ho AND us
  // color ke liye sizes ho (bags ke liye yeh hamesha khali array rahega)
  const sizes = selectedColor ? getProductSizes(product, selectedColor) : [];
  const hasSizes = sizes.length > 0;

  // Selected combination (ya sirf color, bags ke liye) ka stock — Add to
  // Bag button aur error messages isi par depend karte hain
  const currentStock = selectedColor
    ? getVariantStock(product, selectedColor, hasSizes ? selectedSize : null)
    : null;

  function handleAddToBag() {
    if (!selectedColor) {
      setVariantError("Please select a color.");
      return;
    }
    if (hasSizes && !selectedSize) {
      setVariantError("Please select a size.");
      return;
    }
    if (currentStock === 0 || currentStock === null) {
      setVariantError("This option is out of stock.");
      return;
    }
    setVariantError("");

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        // Naam mein color/size bhi shamil kar rahe hain taake cart mein
        // dikhe ke kaunsa variant add hua (jaise "Classic Block Heels — Black, 39")
        name: `${product.name} — ${selectedColor}${selectedSize ? `, ${selectedSize}` : ""}`,
        price: product.price,
      },
      quantity
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="crumb" style={{ marginBottom: 20 }}>
          <Link href="/shop">Shop</Link> / {product.name}
        </div>

        <div className="product-detail-grid">
          <CategoryVisual id={product.id} category={product.category} size="detail">
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

          <div className="product-detail-info">
            <div className="cat">{product.category === "bag" ? "Bags" : "Shoes"}</div>
            <h1>{product.name}</h1>
            <PriceTag price={product.price} originalPrice={product.salePrice} size="lg" />

            {/* Color swatches — sirf woh colors dikhte hain jinke variants
                exist karte hain (variants array se derive, hardcoded nahi) */}
            <div className="variant-group">
              <label>
                Color{" "}
                {selectedColor && <span className="selected-value">— {selectedColor}</span>}
              </label>
              <div className="color-swatches">
                {colors.map((color) => {
                  const colorOut = isColorSoldOut(product, color);
                  return (
                    <button
                      key={color}
                      className={`color-swatch ${selectedColor === color ? "selected" : ""} ${colorOut ? "out-of-stock" : ""}`}
                      style={{ borderColor: selectedColor === color ? "#7c5636" : "transparent" }}
                      onClick={() => {
                        if (colorOut) return; // khatam color select hi nahi hogi
                        setSelectedColor(color);
                        setSelectedSize(null); // color badalte hi purani size reset — size dusre color mein available na ho sakti
                        setVariantError("");
                      }}
                      disabled={colorOut}
                      aria-label={colorOut ? `${color} (out of stock)` : color}
                      aria-pressed={selectedColor === color}
                      title={colorOut ? "Out of stock" : undefined}
                    >
                      <span
                        className="color-swatch-inner"
                        style={{ background: colorToHex(color) }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selector — sirf tab dikhta hai jab color chun li gayi ho
                aur us color ke liye sizes exist karti hon (shoes). Har size
                button apna stock check karta hai — 0 stock waali size
                disabled/greyed out dikhti hai, click nahi hoti. */}
            {selectedColor && hasSizes && (
              <div className="variant-group">
                <label>
                  Select Size{" "}
                  {selectedSize && <span className="selected-value">— {selectedSize}</span>}
                </label>
                <div className="size-options">
                  {sizes.map((size) => {
                    const stock = getVariantStock(product, selectedColor, size);
                    const outOfStock = stock === 0;
                    return (
                      <button
                        key={size}
                        className={`size-option ${selectedSize === size ? "selected" : ""} ${outOfStock ? "out-of-stock" : ""}`}
                        onClick={() => {
                          if (outOfStock) return; // khatam size click hi nahi hogi
                          setSelectedSize(size);
                          setVariantError("");
                        }}
                        disabled={outOfStock}
                        aria-pressed={selectedSize === size}
                        title={outOfStock ? "Out of stock" : undefined}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {variantError && <p className="variant-error">{variantError}</p>}

            <Button onClick={handleAddToBag} fullWidth disabled={soldOut}>
              {soldOut ? "Sold Out" : "Add to Bag"}
            </Button>

            <p className="cod-note" style={{ marginTop: 16 }}>
              Cash on Delivery available nationwide · 7-day exchange
            </p>

            <p className="product-description">{product.description}</p>

            {/* Generic placeholder content abhi — aap baad mein real
                Size Guide/Details/Returns content de dena, sirf yeh
                <AccordionSection> ke andar wala text replace karna hoga */}
            <div style={{ marginTop: 8 }}>
              <AccordionSection title="Size Guide">
                Sizes are true to fit. If you're between sizes, we recommend
                sizing up. (Placeholder — replace with your real size chart.)
              </AccordionSection>
              <AccordionSection title="Product Details & Composition">
                Materials, care instructions, and construction details go
                here. (Placeholder — replace with real product details.)
              </AccordionSection>
              <AccordionSection title="Deliveries & Returns">
                Nationwide delivery in 2–6 working days. 7-day exchange
                window on unworn items. (Placeholder — replace with your
                real policy.)
              </AccordionSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
// "use client" zaroori hai — quantity/color/size selection (useState) aur
// "Add to Bag" (useCart) dono client-side interactivity hain.

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
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
  // Sab hooks upar, unconditionally declare karte hain — chahe product
  // load hua ho ya nahi, taake "rules of hooks" na tootein
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [variantError, setVariantError] = useState("");

  // Live data /api/products/[slug] se — admin ke edits reflect karta hai
  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFoundFlag(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProduct(data);
        setIsLoading(false);
      });
  }, [params.slug]);

  if (notFoundFlag) {
    notFound();
    return null;
  }

  if (isLoading || !product) {
    return (
      <section className="section">
        <div className="wrap">Loading...</div>
      </section>
    );
  }

  const soldOut = isProductSoldOut(product);
  const colors = getProductColors(product);
  const sizes = selectedColor ? getProductSizes(product, selectedColor) : [];
  const hasSizes = sizes.length > 0;

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
          <CategoryVisual id={product.id} category={product.category} size="detail" image={product.image}>
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
                        if (colorOut) return;
                        setSelectedColor(color);
                        setSelectedSize(null);
                        setVariantError("");
                      }}
                      disabled={colorOut}
                      aria-label={colorOut ? `${color} (out of stock)` : color}
                      aria-pressed={selectedColor === color}
                      title={colorOut ? "Out of stock" : undefined}
                    >
                      <span className="color-swatch-inner" style={{ background: colorToHex(color) }} />
                    </button>
                  );
                })}
              </div>
            </div>

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
                          if (outOfStock) return;
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
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
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
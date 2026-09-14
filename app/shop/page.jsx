"use client";
// "use client" zaroori hai — filter pills ka useState, aur URL se
// ?category= parameter padhne ke liye useSearchParams() dono client-side
// hooks hain.

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getProductsByCategory } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

// FILTERS ab categories.js se generate hoti hai — "All" hamesha pehla
// option hai, uske baad har category apna pill banata hai. Naya category
// (jaise "Belt") categories.js mein add hote hi yahan khud pill ban jayega,
// is file ko chedne ki zaroorat nahi.
const FILTERS = [
  { key: "all", label: "All" },
  ...categories.map((cat) => ({ key: cat.slug, label: cat.name })),
];

// Next.js ka rule: useSearchParams() use karne wale kisi bhi component ko
// <Suspense> ke andar hona ZAROORI hai, warna build/static-export fail ho
// jata hai ("should be wrapped in a suspense boundary" error). Isliye asal
// logic ko ek alag ShopContent component mein nikal diya, aur ShopPage
// (page ka default export) sirf usko Suspense ke andar render karta hai.
export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();

  // Agar user Home page se "/shop?category=bag" jaisa link click karke aaya
  // hai, to woh category shuru se hi selected honi chahiye — is default
  // value ko useState ke initial value mein hi set kar rahe hain.
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Filter apply — yeh har render par chalta hai, lekin products.js ka array
  // itna chhota hai ke performance ki fiqar nahi (Phase 3 mein database query
  // khud filter karke dega, yeh client-side filtering nahi hogi)
  const filteredProducts = getProductsByCategory(activeCategory);

  return (
    <>
      <div className="page-header">
        <div className="wrap">
          <div className="crumb">Home / Shop</div>
          <h1>Bags & shoes, all in one place</h1>
          <p>
            Every style below ships nationwide with cash on delivery and a
            7-day exchange window.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="shop-toolbar">
            <div className="filter-pills">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  className={`pill ${activeCategory === filter.key ? "active" : ""}`}
                  onClick={() => setActiveCategory(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="result-count">{filteredProducts.length} products</div>
          </div>

          <ProductGrid
            products={filteredProducts}
            emptyMessage="No products in this category yet."
          />
        </div>
      </section>
    </>
  );
}

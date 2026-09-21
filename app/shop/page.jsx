"use client";
// "use client" zaroori hai — filter pills ka useState, aur URL se
// ?category= parameter padhne ke liye useSearchParams() dono client-side
// hooks hain.

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Ab client-side hardcoded array nahi — live data /api/products se aata
  // hai (jo admin ke edits reflect karta hai)
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter pills bhi live categories se | /api/categories (jo store se
  // aati hain) — admin ka naya category turant yahan pill ban jata hai
  const [filters, setFilters] = useState([{ key: "all", label: "All" }]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]).then(([productsData, catData]) => {
      setProducts(productsData);
      setFilters([
        { key: "all", label: "All" },
        ...catData.map((cat) => ({ key: cat.slug, label: cat.name })),
      ]);
      setIsLoading(false);
    });
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

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
              {filters.map((filter) => (
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

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ProductGrid
              products={filteredProducts}
              emptyMessage="No products in this category yet."
            />
          )}
        </div>
      </section>
    </>
  );
}
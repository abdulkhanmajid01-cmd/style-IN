// ProductGrid.jsx — koi "use client" nahi chahiye. Yeh khud koi state ya
// event handle nahi karta, sirf ProductCard components ki list banata hai
// (ProductCard khud client component hai, jo bilkul theek hai — server
// component client components ko render kar sakta hai).

import ProductCard from "./ProductCard";

// products: array of product objects (lib/data/products.js se, ya baad mein
// database se). emptyMessage: agar array khali ho to kya dikhana hai.
export default function ProductGrid({ products, emptyMessage = "No products found." }) {
  // Khali state ko handle karna zaroori hai — jaise Shop page par agar
  // koi filter apply karne se koi result na bache
  if (!products || products.length === 0) {
    return <p className="result-count">{emptyMessage}</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        // key={product.id} React ko batata hai har card ko uniquely track karna —
        // is ke bina list re-render hone par bugs aa sakte hain (galat card update hona)
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

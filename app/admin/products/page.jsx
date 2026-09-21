"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductForm from "@/components/admin/ProductForm";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null); // null | "new" | product object

  async function loadProducts() {
    setIsLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    loadProducts();
  }

  function handleSaved() {
    setFormTarget(null);
    loadProducts();
  }

  function totalStock(product) {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1>Products</h1>
        </div>
        <LogoutButton />
      </div>

      {formTarget ? (
        <ProductForm
          product={formTarget === "new" ? null : formTarget}
          onSaved={handleSaved}
          onCancel={() => setFormTarget(null)}
        />
      ) : (
        <>
          <Button onClick={() => setFormTarget("new")} className="admin-add-btn">
            + Add Product
          </Button>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>Rs. {product.price.toLocaleString()}</td>
                    <td>{totalStock(product) === 0 ? "Sold Out" : totalStock(product)}</td>
                    <td className="admin-table-actions">
                      <button onClick={() => setFormTarget(product)}>Edit</button>
                      <button onClick={() => handleDelete(product.id, product.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
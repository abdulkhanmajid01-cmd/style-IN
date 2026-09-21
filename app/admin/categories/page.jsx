"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CategoryForm from "@/components/admin/CategoryForm";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // null = create mode

  async function loadData() {
    setIsLoading(true);
    // Products bhi lete hain — table mein har category ke product count
    // dikhane ke liye (products/admin page jaisa hi live data pattern)
    const [cats, prods] = await Promise.all([
      fetch("/api/admin/categories").then((res) => res.json()),
      fetch("/api/admin/products").then((res) => res.json()),
    ]);
    setCategories(cats);
    setProducts(prods);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function productCount(slug) {
    return products.filter((p) => p.category === slug).length;
  }

  function handleSaved() {
    setShowForm(false);
    setEditCategory(null);
    loadData();
  }

  async function handleDelete(slug, name) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/categories?slug=${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed.");
      return;
    }
    loadData();
  }

  function openCreate() {
    setEditCategory(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditCategory(null);
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1>Categories</h1>
        </div>
        <LogoutButton />
      </div>

      {showForm ? (
        <CategoryForm
          category={editCategory}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      ) : (
        <>
          <Button onClick={openCreate} className="admin-add-btn">
            + Add Category
          </Button>

          {isLoading ? (
            <p>Loading...</p>
          ) : categories.length === 0 ? (
            <p style={{ color: "var(--grey)" }}>No categories yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.slug}>
                    <td>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>{productCount(cat.slug)}</td>
                    <td className="admin-table-actions">
                      <button
                        onClick={() => {
                          setEditCategory(cat);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat.slug, cat.name)}>
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
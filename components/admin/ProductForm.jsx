"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/slugify";
import { categories } from "@/lib/data/categories";

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || categories[0]?.slug || "",
    price: product?.price || "",
    salePrice: product?.salePrice || "",
    badge: product?.badge || "",
    description: product?.description || "",
  });

  const [image, setImage] = useState(product?.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [defaultStock, setDefaultStock] = useState(5);

  const [variants, setVariants] = useState(product?.variants || []);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    const uploadData = new FormData();
    uploadData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: uploadData,
    });

    setIsUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Image upload failed.");
      return;
    }

    const data = await res.json();
    setImage(data.url);
  }

  function handleVariantStockChange(index, newStock) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: Number(newStock) || 0 } : v))
    );
  }

  function buildVariantsFromInputs() {
    const colors = colorsInput.split(",").map((c) => c.trim()).filter(Boolean);
    const sizes = sizesInput.split(",").map((s) => s.trim()).filter(Boolean);

    if (colors.length === 0) return [];

    if (sizes.length === 0) {
      return colors.map((color) => ({ color, stock: Number(defaultStock) || 0 }));
    }

    return colors.flatMap((color) =>
      sizes.map((size) => ({ color, size, stock: Number(defaultStock) || 0 }))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price || !formData.category) {
      setError("Name, price, and category are required.");
      return;
    }

    const payload = {
      ...formData,
      image,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      badge: formData.badge || null,
      slug: isEdit ? product.slug : slugify(formData.name),
      variants: isEdit ? variants : buildVariantsFromInputs(),
    };

    if (!isEdit && payload.variants.length === 0) {
      setError("Add at least one color.");
      return;
    }

    setIsSaving(true);

    const res = await fetch("/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: product.id, ...payload } : payload),
    });

    setIsSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    onSaved();
  }

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Product Image</label>
        {image && (
          <img src={image} alt="Preview" className="admin-image-preview" />
        )}
        <input type="file" accept="image/*" onChange={handleImageSelect} />
        {isUploading && <p className="field-hint">Uploading...</p>}
      </div>

      <div className="form-field">
        <label>Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="form-field">
        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-row">
        <div className="form-field">
          <label>Price (PKR)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Sale Price (optional)</label>
          <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} />
        </div>
      </div>

      <div className="form-field">
        <label>Badge</label>
        <select name="badge" value={formData.badge} onChange={handleChange}>
          <option value="">None</option>
          <option value="new">New</option>
          <option value="sale">Sale</option>
        </select>
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </div>

      {isEdit ? (
        <div className="form-field">
          <label>Stock per variant</label>
          <div className="variant-stock-grid">
            {variants.map((v, i) => (
              <div key={i} className="variant-stock-row">
                <span>
                  {v.color}
                  {v.size ? `, ${v.size}` : ""}
                </span>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => handleVariantStockChange(i, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="form-field">
            <label>Colors (comma-separated)</label>
            <input
              value={colorsInput}
              onChange={(e) => setColorsInput(e.target.value)}
              placeholder="e.g. Black, Tan"
            />
          </div>
          <div className="form-field">
            <label>Sizes (comma-separated, optional — bags ke liye khali chhorein)</label>
            <input
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
              placeholder="e.g. 37, 38, 39"
            />
          </div>
          <div className="form-field">
            <label>Starting stock (per color/size combination)</label>
            <input
              type="number"
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value)}
              min="0"
            />
          </div>
        </>
      )}

      {error && <p className="field-error">{error}</p>}

      <div className="admin-form-actions">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
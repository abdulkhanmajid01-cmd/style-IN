"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

// Category ke liye icon fallback ke options — phase 1 ki tarah sirf bag/shoe
// hain. Agar admin bannerImage upload kare to image use hogi, warna yeh icon
const VISUAL_OPTIONS = [
  { value: "bag", label: "Bag icon" },
  { value: "shoe", label: "Shoe icon" },
];

export default function CategoryForm({ category, onSaved, onCancel }) {
  const isEdit = Boolean(category);

  // Edit mode mein existing values pre-fill hoti hain — create mode khali
  const [formData, setFormData] = useState({
    name: category?.name || "",
    bannerTitle: category?.bannerTitle || "",
    bannerSubtitle: category?.bannerSubtitle || "",
    visual: category?.visual || "bag",
  });

  const [bannerImage, setBannerImage] = useState(category?.bannerImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Image upload handler — ProductForm.jsx jaisa hi pattern (/api/admin/upload)
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
    setBannerImage(data.url);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      bannerTitle: formData.bannerTitle,
      bannerSubtitle: formData.bannerSubtitle,
      bannerImage,
      visual: formData.visual,
    };

    const res = await fetch("/api/admin/categories", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { slug: category.slug, ...payload } : payload),
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
        <label>Banner Image (optional)</label>
        {bannerImage && (
          <img src={bannerImage} alt="Preview" className="admin-image-preview" />
        )}
        <input type="file" accept="image/*" onChange={handleImageSelect} />
        {isUploading && <p className="field-hint">Uploading...</p>}
      </div>

      <div className="form-field">
        <label>Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Joggers" />
        {isEdit && (
          <p className="field-hint">Slug ({category.slug}) change nahi hota — products isi se link hain.</p>
        )}
      </div>

      <div className="form-field">
        <label>Banner Title</label>
        <input name="bannerTitle" value={formData.bannerTitle} onChange={handleChange} placeholder="e.g. JOGGERS" />
      </div>

      <div className="form-field">
        <label>Banner Subtitle</label>
        <input name="bannerSubtitle" value={formData.bannerSubtitle} onChange={handleChange} placeholder="e.g. FLAT 30% OFF" />
      </div>

      <div className="form-field">
        <label>Visual / Icon fallback</label>
        <select name="visual" value={formData.visual} onChange={handleChange}>
          {VISUAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="field-hint">Banner image na ho to yeh icon fallback banega.</p>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="admin-form-actions">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
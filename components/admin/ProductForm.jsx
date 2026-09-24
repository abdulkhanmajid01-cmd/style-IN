"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/slugify";

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product);

  // Categories ab static import ki jagah /api/admin/categories se fetch hoti
  // hain — taake admin ka naya add kiya hua category turant dropdown aaye
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    salePrice: product?.salePrice || "",
    badge: product?.badge || "",
    description: product?.description || "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

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

  function handleRemoveVariant(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // Input ko comma YA newline dono se split karte hain — taake admin ka
  // "black, white\nred" jaisa copy-paste bhi sahi parsa jaye
  function splitValues(value) {
    return String(value || "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // "black" → "Black", "sky blue" → "Sky Blue" — colors consistent normalize
  function titleCase(value) {
    return value
      .split(" ")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(" ");
  }

  // Color+size ka unique key — duplicate variant detect karne ke liye
  function variantKey(color, size) {
    return `${String(color).trim().toLowerCase()}|${size ? String(size).trim() : ""}`;
  }

  function buildVariantsFromInputs() {
    const colors = splitValues(colorsInput).map(titleCase);
    const sizes = splitValues(sizesInput);
    const stock = Number(defaultStock) || 0;

    if (colors.length === 0) return [];

    if (sizes.length === 0) {
      return colors.map((color) => ({ color, stock }));
    }

    return colors.flatMap((color) =>
      sizes.map((size) => ({ color, size, stock }))
    );
  }

  // Naye variants ko existing variants mein MERGE karte hain — duplicate
  // color+size dobara add nahi hota, naya combination default stock leta hai
  function handleAddVariants() {
    const newVariants = buildVariantsFromInputs();
    if (newVariants.length === 0) {
      setError("Colors mein kam se kam ek color add karein.");
      return;
    }
    const existingKeys = new Set(variants.map((v) => variantKey(v.color, v.size)));
    const extra = newVariants.filter((nv) => !existingKeys.has(variantKey(nv.color, nv.size)));
    setVariants((prev) => [...prev, ...extra]);
    setError(extra.length === 0 ? "Enter kiya hua color+size pehle se maujood hai." : "");
    setColorsInput("");
    setSizesInput("");
  }

  const previewVariants = buildVariantsFromInputs();
  const variantPreviewText = previewVariants
    .map((v) => (v.size ? `${v.color}/${v.size}` : v.color))
    .join(", ");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price || !formData.category) {
      setError("Name, price, and category are required.");
      return;
    }

    const price = Number(formData.price);
    const salePriceValue = formData.salePrice ? Number(formData.salePrice) : null;

    // Sale price agar di gayi hai to regular price se KAM honi chahiye
    if (salePriceValue !== null && salePriceValue >= price) {
      setError("Sale price regular price se kam honi chahiye.");
      return;
    }

    // Sale price ho aur badge khali ho to khud-ba-khud "sale" set kar do
    const badge = formData.badge || (salePriceValue ? "sale" : null);

    const payload = {
      ...formData,
      image,
      price,
      salePrice: salePriceValue,
      badge,
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
          <p className="field-hint">Discounted price — regular price se kam</p>
        </div>
      </div>

      <div className="form-field">
        <label>Badge</label>
        <select name="badge" value={formData.badge} onChange={handleChange}>
          <option value="">None</option>
          <option value="new">New</option>
          <option value="sale">Sale</option>
        </select>
        <p className="field-hint">Sale price ho aur badge na chuna ho to &quot;Sale&quot; khud lag jata hai.</p>
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </div>

      {isEdit ? (
        <>
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
                  <button
                    type="button"
                    className="variant-remove"
                    onClick={() => handleRemoveVariant(i)}
                    aria-label={`Remove ${v.color}${v.size ? `, ${v.size}` : ""}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "18px 0" }} />

          <div className="form-field">
            <label>Add more colors/sizes</label>
            <p className="field-hint" style={{ marginBottom: 10 }}>
              Naye color/size combinations existing variants mein merge ho jate hain.
            </p>
            <input
              style={{ marginBottom: 8 }}
              value={colorsInput}
              onChange={(e) => setColorsInput(e.target.value)}
              placeholder="e.g. Black, White"
            />
            <input
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
              placeholder="e.g. 37, 38 (bag ho to khali)"
            />
            <div className="form-field" style={{ marginBottom: 8 }}>
              <label style={{ marginTop: 10 }}>Starting stock (naye combinations ke liye)</label>
              <input
                type="number"
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.target.value)}
                min="0"
              />
            </div>
            {variantPreviewText && (
              <p className="field-hint">
                Yeh variants banenge: {variantPreviewText}
              </p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariants}>
              Add variants
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="form-field">
            <label>Colors (comma-separated)</label>
            <input
              value={colorsInput}
              onChange={(e) => setColorsInput(e.target.value)}
              placeholder="e.g. Black, Tan"
            />
            <p className="field-hint">Har color comma se alag karein, jaise: Black, White, Red</p>
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
          {variantPreviewText && (
            <p className="field-hint">
              Yeh variants banenge: {variantPreviewText}
            </p>
          )}
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
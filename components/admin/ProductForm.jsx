"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/slugify";
import {
  getProductImages,
  resolveCategoryTrait,
  traitToAttributes,
} from "@/lib/product-utils";

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product);

  // Categories ab static import ki jagah /api/admin/categories se fetch hoti
  // hain — taake admin ka naya add kiya hua category turant dropdown aaye
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price ?? "",
    salePrice: product?.salePrice ?? "",
    badge: product?.badge || "",
    description: product?.description || "",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/categories")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Categories load nahi ho sake."))
      )
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error("Categories load nahi ho sake.");
        setCategories(data);
        setCategoriesError("");
      })
      .catch(() => {
        if (!cancelled) setCategoriesError("Categories load nahi ho sakein — page reload karein.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Gallery (multiple images) ----
  const [images, setImages] = useState(() => getProductImages(product));
  const [isUploading, setIsUploading] = useState(false);

  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [defaultStock, setDefaultStock] = useState(5);

  const [variants, setVariants] = useState(product?.variants || []);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ---- Dynamic category trait ----
  // Selected category se decide hota hai ke size input dikhega ya nahi, uska
  // label kya hoga, aur variants JSON mein `size` key aayegi ya nahi.
  const trait = useMemo(
    () => resolveCategoryTrait(formData.category, categories),
    [formData.category, categories]
  );
  const usesSizes = trait.usesSizes;

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
    const sizes = usesSizes ? splitValues(sizesInput) : [];
    const stock = Number(defaultStock) || 0;

    if (colors.length === 0) return [];

    // Size-less categories (bags, wallets, ...) — variants mein `size` key
    // hoti hi nahi, sirf color + stock. Yeh poora point hai: har category ka
    // apna variant shape.
    if (sizes.length === 0) {
      return colors.map((color) => ({ color, stock }));
    }

    return colors.flatMap((color) => sizes.map((size) => ({ color, size, stock })));
  }

  // ---- Handlers ----

  // `e.currentTarget` (native `e.target` ke bajaye) React ka recommended
  // source hai — synthetic event reuse/async scenarios mein `target` null
  // ho sakta hai, `currentTarget` hamesha live element rehta hai.
  function handleChange(e) {
    const field = e.currentTarget;
    const { name, value } = field;
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Category change: size-less category pe ja rahe hain to purana sizes input
  // aur already saved variants ki `size` key dono saaf kar dete hain, warna DB
  // mein aisa variant ban jayega jo form ke khilaf hai.
  function handleCategoryChange(e) {
    const nextCategory = e.currentTarget.value;
    const nextTrait = resolveCategoryTrait(nextCategory, categories);

    setError("");
    setFormData((prev) => ({ ...prev, category: nextCategory }));

    if (nextTrait.usesSizes) return;

    setSizesInput("");
    setVariants((prev) => {
      const stripped = prev.map(({ color, stock }) => ({ color, stock }));
      const seen = new Set();
      return stripped.filter((v) => {
        const key = variantKey(v.color, null);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  }

  async function handleImageSelect(e) {
    const input = e.currentTarget;
    const files = Array.from(input.files || []);
    // Input reset taake wahi file dobara select karne par change event fire ho
    input.value = "";
    if (files.length === 0) return;

    setError("");
    setIsUploading(true);

    const uploadData = new FormData();
    // `files` (plural) — route ab array handle karta hai aur array of URLs
    // wapas deta hai.
    files.forEach((file) => uploadData.append("files", file));

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Image upload failed.");
        return;
      }

      const data = await res.json();
      const urls = Array.isArray(data.urls) ? data.urls : data.url ? [data.url] : [];
      if (urls.length === 0) {
        setError("Image upload failed.");
        return;
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Image upload failed — connection check karein.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMakePrimary(index) {
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      return [picked, ...next];
    });
  }

  function handleVariantStockChange(index, newStock) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: Number(newStock) || 0 } : v))
    );
  }

  function handleRemoveVariant(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
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

  // ---- Validation ----
  // Har field ko trim + type-check karke padha jata hai. Pehle wala check
  // sirf `!value` tha, jis se whitespace-only string (jaise " ") truthy thi aur
  // number fields par koi validation nahi thi.
  function validate() {
    const name = String(formData.name ?? "").trim();
    const category = String(formData.category ?? "").trim();
    const priceRaw = String(formData.price ?? "").trim();
    const saleRaw = String(formData.salePrice ?? "").trim();

    if (!name) return "Product name is required.";
    // Category select ka placeholder option ("") yahan pakadta hai — UI ke
    // pehle koi bhi category visually selected dikhta tha jabki state khali
    // thi, isi se ye error aata tha.
    if (!category) return "Please choose a category.";

    if (priceRaw === "") return "Price is required.";
    const price = Number(priceRaw);
    if (!Number.isFinite(price)) return "Price ek number hona chahiye.";
    if (price <= 0) return "Price 0 se zyada honi chahiye.";

    let salePrice = null;
    if (saleRaw !== "") {
      salePrice = Number(saleRaw);
      if (!Number.isFinite(salePrice)) return "Sale price ek number hona chahiye.";
      if (salePrice <= 0) return "Sale price 0 se zyada honi chahiye.";
      if (salePrice >= price) return "Sale price regular price se kam honi chahiye.";
    }

    const finalVariants = isEdit ? variants : buildVariantsFromInputs();
    if (finalVariants.length === 0) {
      return "Add at least one color.";
    }
    // Jo bhi category, usi ke mutabiq variants validate karo
    for (const v of finalVariants) {
      if (!v.color) return "Har variant ka color hona chahiye.";
      if (usesSizes && !v.size && splitValues(sizesInput).length > 0) {
        return `“${v.color}” ka size missing hai.`;
      }
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (categoriesError) {
      setError(categoriesError);
      return;
    }

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const price = Number(String(formData.price).trim());
    const saleRaw = String(formData.salePrice ?? "").trim();
    const salePriceValue = saleRaw === "" ? null : Number(saleRaw);

    // Sale price ho aur badge khali ho to khud-ba-khud "sale" set kar do
    const badge = formData.badge || (salePriceValue ? "sale" : null);
    const finalVariants = isEdit ? variants : buildVariantsFromInputs();

    const payload = {
      ...formData,
      name: String(formData.name).trim(),
      category: String(formData.category).trim(),
      description: String(formData.description ?? ""),
      image: images[0] ?? null,
      images,
      attributes: traitToAttributes(trait),
      price,
      salePrice: salePriceValue,
      badge,
      slug: isEdit ? product.slug : slugify(String(formData.name).trim()),
      variants: finalVariants,
    };

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: product.id, ...payload } : payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong.");
        return;
      }

      onSaved();
    } catch {
      setError("Save nahi ho saka — connection check karein.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-product-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label>Product Images (first one is the main image)</label>
        {images.length > 0 && (
          <div className="admin-image-grid">
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="admin-image-thumb">
                <img src={src} alt={`Preview ${i + 1}`} className="admin-image-preview" />
                {i === 0 && <span className="admin-image-badge">Main</span>}
                <div className="admin-image-actions">
                  {i !== 0 && (
                    <button type="button" onClick={() => handleMakePrimary(i)}>
                      Make main
                    </button>
                  )}
                  <button type="button" onClick={() => handleRemoveImage(i)} aria-label={`Remove image ${i + 1}`}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* `multiple` — ek baare mein kai images select karke bulk upload */}
        <input type="file" accept="image/*" multiple onChange={handleImageSelect} />
        <p className="field-hint">
          Ek ya kai images select karein (JPG, PNG, WEBP, GIF · 5 MB tak per image). Pehli
          image product card aur detail page ki main image banegi.
        </p>
        {isUploading && <p className="field-hint">Uploading...</p>}
      </div>

      <div className="form-field">
        <label>Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Classic Leather Tote"
        />
      </div>

      <div className="form-field">
        <label>Category</label>
        {/* BUG FIX: pehle koi placeholder option nahi tha. React `value=""`
           ko match nahi kar pata, to browser pehla option khud select kar
           deta tha — admin ko category "chuni hui" lagti thi jabki formData
           mein `category` khali hota tha, aur submit "Name, price, and
           category are required." maar deta tha. Ab value aur UI hamesha
           match karte hain. */}
        <select
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {categoriesError && <p className="field-error">{categoriesError}</p>}
      </div>

      <div className="admin-form-row">
        <div className="form-field">
          <label>Price (PKR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="any"
            required
            placeholder="e.g. 4990"
          />
        </div>
        <div className="form-field">
          <label>Sale Price (optional)</label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            min="0"
            step="any"
            placeholder="e.g. 3990"
          />
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
                <div key={variantKey(v.color, v.size) + i} className="variant-stock-row">
                  <span>
                    {v.color}
                    {v.size ? `, ${v.size}` : ""}
                  </span>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantStockChange(i, e.currentTarget.value)}
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
            {variants.length === 0 && (
              <p className="field-hint">Abhi koi variant nahi — neeche se add karein.</p>
            )}
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
              onChange={(e) => setColorsInput(e.currentTarget.value)}
              placeholder="e.g. Black, White"
            />
            {usesSizes && (
              <input
                value={sizesInput}
                onChange={(e) => setSizesInput(e.currentTarget.value)}
                placeholder={trait.placeholder}
              />
            )}
            <div className="form-field" style={{ marginBottom: 8 }}>
              <label style={{ marginTop: 10 }}>Starting stock (naye combinations ke liye)</label>
              <input
                type="number"
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.currentTarget.value)}
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
              onChange={(e) => setColorsInput(e.currentTarget.value)}
              placeholder="e.g. Black, Tan"
            />
            <p className="field-hint">Har color comma se alag karein, jaise: Black, White, Red</p>
          </div>

          {/* Dynamic Sizes field — category ke hisaab se label/visibility badalti hai */}
          {usesSizes ? (
            <div className="form-field">
              <label>{trait.label}</label>
              <input
                value={sizesInput}
                onChange={(e) => setSizesInput(e.currentTarget.value)}
                placeholder={trait.placeholder}
              />
              <p className="field-hint">{trait.hint}</p>
            </div>
          ) : (
            <div className="form-field">
              <label>Sizes</label>
              {/* Size-less categories (bags etc.) — field render hi nahi hoti */}
              <input value="" disabled placeholder="Not applicable for this category" />
              <p className="field-hint">{trait.noSizesNotice}</p>
            </div>
          )}

          <div className="form-field">
            <label>Starting stock (per color/size combination)</label>
            <input
              type="number"
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.currentTarget.value)}
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

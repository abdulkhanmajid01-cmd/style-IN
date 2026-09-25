// lib/product-utils.js — Product ke display helpers (client-safe, koi DB import nahi).
// Product objects wohi shape lete hain jo store.js (lib/data/store.js) DB se deta
// hai: { id, slug, name, category (slug), price, salePrice, badge, variants, ... }.
// NOTE: formatCategoryLabel ab categories array par depend nahi karta — slug ka
// Title-Case karta hai ("bag" → "Bag"). Real category names client par Google
// nahi hota (product detail page /api/categories se naam fetch karta hai).

export const COLOR_HEX = {
  Black: "#1a1a1a",
  White: "#f5f5f0",
  Tan: "#b08968",
  Brown: "#5c4033",
  Cream: "#f0e6d6",
  Grey: "#9a978f",
  Gray: "#9a978f",
  Gold: "#c9a24b",
  Silver: "#c4c4c4",
  Navy: "#1e2a4a",
  Red: "#c1272d",
  Maroon: "#6f1d1b",
  Pink: "#e8a2b6",
  Blue: "#2b4f9e",
  "Sky Blue": "#8fc6e8",
  Green: "#3f7d4a",
  Olive: "#7d8262",
  Beige: "#d8c3a5",
  Purple: "#6a4c93",
  Yellow: "#e6c229",
  Orange: "#e0862b",
  Mustard: "#d9a441",
  Nude: "#e3c4ae",
  Camel: "#b8865a",
};

export function colorToHex(name) {
  if (!name) return "#bbb";
  const key = String(name).trim();
  const lower = key.toLowerCase();
  const match = Object.keys(COLOR_HEX).find((c) => c.toLowerCase() === lower);
  return match ? COLOR_HEX[match] : "#bbb";
}

export function getDisplayPrice(product) {
  const price = Number(product.price) || 0;
  const hasSale = product.salePrice !== null && product.salePrice !== undefined && product.salePrice !== "";
  const sale = hasSale ? Number(product.salePrice) || 0 : null;

  if (sale === null) return { current: price, original: null };
  return {
    current: Math.min(price, sale),
    original: Math.max(price, sale),
  };
}

export function formatCategoryLabel(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ---- Images ----

// Product ki images ko hamesha ek saaf ordered string-array mein normalize
// karte hain. DB mein `images` JSON array hai aur `image` primary hai, lekin
// purane rows / partial updates mein sirf `image` ho sakta hai — isliye
// `image` ko fallback + list ke shuru mein force karte hain.
export function getProductImages(product) {
  if (!product) return [];
  const raw = Array.isArray(product.images) ? product.images : [];
  const list = raw
    .map((entry) => (typeof entry === "string" ? entry : entry?.url))
    .filter((url) => typeof url === "string" && url.trim().length > 0)
    .map((url) => url.trim());

  const primary =
    typeof product.image === "string" ? product.image.trim() : "";
  if (primary && !list.includes(primary)) list.unshift(primary);

  return [...new Set(list)];
}

export function getProductColors(product) {
  return [...new Set(product.variants.map((v) => v.color))];
}

export function getProductSizes(product, color) {
  return product.variants
    .filter((v) => v.color === color && v.size)
    .map((v) => v.size);
}

export function getVariantStock(product, color, size) {
  const variant = product.variants.find(
    (v) => v.color === color && (size ? v.size === size : !v.size)
  );
  return variant ? variant.stock : 0;
}

export function isProductSoldOut(product) {
  return product.variants.every((v) => v.stock === 0);
}

export function isColorSoldOut(product, color) {
  return product.variants
    .filter((v) => v.color === color)
    .every((v) => v.stock === 0);
}

// ---- Category traits (dynamic per-category variant shape) ----
// Har category ka apna "trait" hai jo decide karta hai ke variants JSON mein
// `size` field aayegi ya nahi, aur size input ka label kya hoga. Isse form
// har category ke liye dynamic ban jata hai — bags par size input bilkul
// chhup jata hai aur unke variants mein `size` key generate hi nahi hoti.
//
// Match order matter karta hai: pehle woh rule jo category kisi bhi doosre
// rule se zyada strongly match kare, wahi jeetta.

const TRAIT_RULES = [
  {
    trait: "size-less",
    // Bags / luggage / chhoti accessories — inki koi size dimension nahi hoti
    keywords: [
      "bag", "bags", "baggage", "luggage", "backpack", "purse", "handbag",
      "clutch", "wallet", "belt", "accessor", "sunglass", "jewel", "scarf",
      "tie", "watch", "keychain", "pouch", "briefcase",
    ],
  },
  {
    trait: "footwear-size",
    // Shoes / sandals — numeric (EU/UK) shoe sizes
    keywords: [
      "shoe", "shoes", "sandal", "sandals", "boot", "boots", "heel", "heels",
      "sneaker", "sneakers", "slipper", "loafer", "loafers", "khussa",
      "footwear", "chappal", "pumps", "flats",
    ],
  },
  {
    trait: "size-or-length",
    // Pants / shirts / kurta etc. — admin "38" (size) ya "40in" (length)
    // dono likh sakta hai, isliye label dono cover karta hai
    keywords: [
      "pant", "pants", "trouser", "trousers", "jean", "jeans", "shirt",
      "shirts", "tee", "tshirt", "top", "tops", "kurta", "kurti", "shalwar",
      "dress", "skirt", "coat", "jacket", "sweater", "hoodie", "suit",
      "clothing", "apparel", "frock", "track", "short", "shorts", " legging",
      "leggings", "cap", "caps",
    ],
  },
];

const TRAIT_DEFAULTS = {
  // Fallback: size input chhupta nahi, lekin generic label rehta hai
  trait: "generic-size",
  dimension: "size",
  label: "Sizes (comma-separated, optional)",
  placeholder: "e.g. Small, Medium, Large",
  hint: "Har size ko comma se alag karein, jaise: S, M, L",
  usesSizes: true,
  /** Neeche wali line admin form mein "sizes" se pehle chhup jaati hai */
  noSizesNotice: "",
};

const TRAIT_MAP = {
  "size-less": {
    trait: "size-less",
    dimension: null,
    label: null,
    placeholder: null,
    hint: "Is category mein size dimension nahi hai — sirf colors ke variants bante hain.",
    usesSizes: false,
    noSizesNotice: "Is category ke liye size nahi hota, is liye sizes input chhupa diya gaya hai.",
  },
  "footwear-size": {
    trait: "footwear-size",
    dimension: "size",
    label: "Shoe Sizes (comma-separated)",
    placeholder: "e.g. 39, 40, 41",
    hint: "Numbers ya UK/EU sizes — jaise: 39, 40, 41",
    usesSizes: true,
    noSizesNotice: "",
  },
  "size-or-length": {
    trait: "size-or-length",
    dimension: "sizeOrLength",
    label: "Sizes / Lengths (comma-separated)",
    placeholder: "e.g. 32, 34, 40in",
    hint: "Sizes aur lengths dono — jaise: Small, Medium, 40in",
    usesSizes: true,
    noSizesNotice: "",
  },
};

// `slug` ya `name` mein keyword aa jaye to woh category ka trait mil gaya.
// `categories` (admin API ka array) diya ho to usse asli category name bhi
// dekhte hain — kuch admins ka slug "cat-1" jaisa generic hota hai.
export function resolveCategoryTrait(slug, categories) {
  if (!slug) return { ...TRAIT_DEFAULTS, empty: true };

  const category = Array.isArray(categories)
    ? categories.find((c) => c?.slug === slug)
    : null;
  const haystack = `${slug} ${category?.name ?? ""}`.toLowerCase();

  for (const rule of TRAIT_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return { ...TRAIT_MAP[rule.trait], empty: false };
    }
  }
  return { ...TRAIT_DEFAULTS, empty: false };
}

// Product row ke liye ek hi source of truth — form payload, DB `attributes`
// column aur storefront sab isi shape ko share karte hain.
export function traitToAttributes(trait) {
  return {
    dimension: trait?.dimension ?? null,
    label: trait?.label ?? null,
    usesSizes: Boolean(trait?.usesSizes),
    trait: trait?.trait ?? "generic-size",
  };
}
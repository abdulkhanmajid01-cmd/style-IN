// lib/data/products.js
// Phase 1: temporary hardcoded data so the UI has something real to render.
// Phase 3 mein yeh file hata di jayegi aur data Prisma/database se aayega —
// isliye shape (keys) wahi rakhi hai jo baad mein DB table ke columns banenge.

import { categories } from "./categories";

// Shared color → hex map. Sab components (ProductCard, product detail page)
// isi ek jagah se read karte hain, taake colors kahin mismatch na hon.
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

// Case-insensitive lookup: trim + lowercase karke map mein dhoondte hain.
// Na milne par ek neutral grey (#bbb) fallback denge taake dot hamesha
// "kuch na kuch" dikhe.
export function colorToHex(name) {
  if (!name) return "#bbb";
  const key = String(name).trim();
  const lower = key.toLowerCase();
  const match = Object.keys(COLOR_HEX).find((c) => c.toLowerCase() === lower);
  return match ? COLOR_HEX[match] : "#bbb";
}

// Sale price semantics: agar salePrice hai to DO mein se KAM wala "current"
// (jo admin bacha hua price chahta hai) aur ZYADA wala "original" (was price).
// SalePrice null ho to sirf price hi milegi. Isse purana seed data (jisme
// salePrice original ki tarah bada hota tha) aur naya admin data (chhota
// salePrice) dono sahi kaam karte hain.
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

// Category slug ko display label banata hai — "bag" → "Bags" (categories
// list se real naam), warna slug ko Title Case kar deta hai ("teeth" → "Teeth").
// Client components (ProductCard) isko use karte hain, jahan live store
// ka data nahi milta, isliye static categories ke baad Title Case fallback.
export function formatCategoryLabel(slug) {
  if (!slug) return "";
  const found = categories.find((cat) => cat.slug === slug);
  if (found) return found.name;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const products = [
  {
    id: "1",
    slug: "the-everyday-tote",
    name: "The Everyday Tote",
    category: "bag", // "bag" | "shoe" — Shop page filter isi field se match karta hai
    price: 4290, // PKR, current selling price
    salePrice: null, // null = sale nahi hai; number ho to strikethrough dikhega
    badge: "new", // "new" | "sale" | null
    description:
      "A structured everyday tote built for laptops, groceries, and everything in between.",
    // Bags mein "size" nahi hoti, isliye variant mein sirf color + stock.
    // Har variant apna stock rakhta hai — admin isi number ko manually
    // update karega jab stock khatam ho ya nayi khep aaye.
    variants: [
      { color: "Tan", stock: 8 },
      { color: "Black", stock: 0 }, // yeh color abhi out of stock hai
    ],
  },
  {
    id: "2",
    slug: "classic-block-heels",
    name: "Classic Block Heels",
    category: "shoe",
    price: 3690,
    salePrice: null,
    badge: null,
    description: "Comfortable block heels that hold up through a full day on your feet.",
    // Shoes mein har color+size combination ka apna stock hota hai
    variants: [
      { color: "Black", size: "37", stock: 3 },
      { color: "Black", size: "38", stock: 5 },
      { color: "Black", size: "39", stock: 0 }, // yeh size khatam
      { color: "Black", size: "40", stock: 2 },
      { color: "Black", size: "41", stock: 4 },
      { color: "Brown", size: "37", stock: 0 },
      { color: "Brown", size: "38", stock: 6 },
      { color: "Brown", size: "39", stock: 3 },
      { color: "Brown", size: "40", stock: 0 },
      { color: "Brown", size: "41", stock: 1 },
    ],
  },
  {
    id: "3",
    slug: "mini-crossbody",
    name: "Mini Crossbody",
    category: "bag",
    price: 2590,
    salePrice: 3690, // yahan "salePrice" ko "original/was" price ki tarah use kar rahe hain
    badge: "sale",
    description: "A compact crossbody for the days you just need your essentials.",
    variants: [
      { color: "Tan", stock: 4 },
      { color: "Cream", stock: 2 },
      { color: "Black", stock: 7 },
    ],
  },
  {
    id: "4",
    slug: "retro-chunky-sneakers",
    name: "Retro Chunky Sneakers",
    category: "shoe",
    price: 4990,
    salePrice: null,
    badge: null,
    description: "Chunky-sole sneakers with a retro silhouette, built for daily wear.",
    variants: [
      { color: "Grey", size: "38", stock: 2 },
      { color: "Grey", size: "39", stock: 3 },
      { color: "Grey", size: "40", stock: 0 },
      { color: "Grey", size: "41", stock: 5 },
      { color: "Grey", size: "42", stock: 1 },
      { color: "Grey", size: "43", stock: 0 },
      { color: "White", size: "38", stock: 0 },
      { color: "White", size: "39", stock: 0 },
      { color: "White", size: "40", stock: 2 },
      { color: "White", size: "41", stock: 3 },
      { color: "White", size: "42", stock: 0 },
      { color: "White", size: "43", stock: 1 },
    ],
  },
  {
    id: "5",
    slug: "structured-satchel",
    name: "Structured Satchel",
    category: "bag",
    price: 5490,
    salePrice: null,
    badge: null,
    description: "A boxy, structured satchel that keeps its shape no matter what you pack.",
    // Is poore product ka har color hi khatam hai — is se "Sold Out" badge
    // test karne ke liye ek deliberately fully-out-of-stock example mil jata hai
    variants: [
      { color: "Black", stock: 0 },
      { color: "Tan", stock: 0 },
    ],
  },
  {
    id: "6",
    slug: "strappy-sandals",
    name: "Strappy Sandals",
    category: "shoe",
    price: 2890,
    salePrice: null,
    badge: null,
    description: "Lightweight strappy sandals for warm-weather days.",
    variants: [
      { color: "Gold", size: "36", stock: 2 },
      { color: "Gold", size: "37", stock: 3 },
      { color: "Gold", size: "38", stock: 0 },
      { color: "Silver", size: "36", stock: 0 },
      { color: "Silver", size: "37", stock: 4 },
      { color: "Silver", size: "38", stock: 2 },
      { color: "Black", size: "36", stock: 5 },
      { color: "Black", size: "37", stock: 5 },
      { color: "Black", size: "38", stock: 5 },
      { color: "Black", size: "39", stock: 3 },
      { color: "Black", size: "40", stock: 1 },
    ],
  },
];

// Helper: slug se ek single product dhoondne ke liye.
// Product detail page (app/product/[slug]/page.jsx) isko use karega.
export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug) || null;
}

// Helper: category ke hisaab se filter karne ke liye.
// "all" pass karne par pura array wapas aata hai.
export function getProductsByCategory(category) {
  if (category === "all") return products;
  return products.filter((product) => product.category === category);
}

// ---- Stock/variant helpers (naye) ----

// Product ke sab available colors (duplicate hataye hue) — variants array se
// nikalte hain, taake ek hi jagah (variants) se sab kuch derive ho, do jagah
// data maintain na karna pade (colors alag se likhne se yeh out-of-sync ho sakta tha)
export function getProductColors(product) {
  return [...new Set(product.variants.map((v) => v.color))];
}

// Diye gaye color ke liye available sizes. Agar product mein sizes hi nahi
// (bags), to khali array wapas aayega — isi se UI decide karta hai ke
// size selector dikhana hai ya nahi.
export function getProductSizes(product, color) {
  return product.variants
    .filter((v) => v.color === color && v.size)
    .map((v) => v.size);
}

// Ek specific color+size (ya sirf color, bags ke liye) ka stock number.
// Size na diya jaye to bags jaise products ke liye color-only match karta hai.
export function getVariantStock(product, color, size) {
  const variant = product.variants.find(
    (v) => v.color === color && (size ? v.size === size : !v.size)
  );
  return variant ? variant.stock : 0;
}

// Poora product sold out hai ya nahi — sab variants ka stock check karta hai.
// ProductCard aur Shop grid mein "Sold Out" badge dikhane ke liye use hoga.
export function isProductSoldOut(product) {
  return product.variants.every((v) => v.stock === 0);
}

// Ek specific COLOR sold out hai ya nahi — us color ke sab sizes (ya bags
// ke liye sirf woh ek entry) ka stock check karta hai. Product detail page
// isse color swatch ko grey-out karega, jaise size buttons ke sath hota hai.
export function isColorSoldOut(product, color) {
  return product.variants
    .filter((v) => v.color === color)
    .every((v) => v.stock === 0);
}

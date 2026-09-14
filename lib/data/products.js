// lib/data/products.js
// Phase 1: temporary hardcoded data so the UI has something real to render.
// Phase 3 mein yeh file hata di jayegi aur data Prisma/database se aayega —
// isliye shape (keys) wahi rakhi hai jo baad mein DB table ke columns banenge.

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

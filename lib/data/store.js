// lib/data/store.js
// PHASE 2 NOTE: Yeh ek in-memory store hai (server ki RAM mein data rehta
// hai) — server restart hone par sab changes reset ho jayenge. Yeh Phase 2
// ke liye theek hai (testing/demo), lekin Phase 3 mein iski jagah Prisma +
// real database (Supabase) le lega — is file ke functions ke NAAM same
// rakhenge (getAllProducts, addProduct, etc.) taake usay call karne wala
// code (API routes) zyada na badalna pade.
//
// IMPORTANT: Saari mutable state ek hi object mein globalThis par rakhte
// hain. Wajah — Next.js dev mode mein API routes aur pages alag-alag
// bundles mein compile hote hain, is liye module-level variables (let ...)
// ki alag copies ban jati thin aur data split ho jata tha (admin jo add
// karta tha woh Home page ko kabhi nahi milta tha). globalThis poore Node
// process mein ek hi hota hai, is liye har bundle usi store ko share kar
// leta hai.

import { products as initialProducts } from "./products";
import { categories as initialCategories } from "./categories";

// Structured clone se ek "deep copy" banate hain — taake yeh mutable copy
// original products.js ke data ko touch na kare
if (!globalThis.__styleInStore) {
  globalThis.__styleInStore = {
    products: structuredClone(initialProducts),
    categories: structuredClone(initialCategories),
    orders: [],
    contactMessages: [],
  };
}
const store = globalThis.__styleInStore;

// ---- Products ----

export function getAllProducts() {
  return store.products;
}

// Storefront pages (Shop, Product detail) yeh function use karenge —
// products.js ke isi-naam function se alag hai kyunke yeh LIVE store
// (admin ke changes ke sath) se data deta hai, static file se nahi
export function getProductBySlug(slug) {
  return store.products.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(category) {
  if (category === "all") return store.products;
  return store.products.filter((p) => p.category === category);
}

export function getProductById(id) {
  return store.products.find((p) => p.id === id) || null;
}

export function addProduct(productData) {
  const newProduct = {
    id: String(Date.now()), // simple unique ID — Phase 3 mein database khud ID degi
    ...productData,
  };
  store.products.push(newProduct);
  return newProduct;
}

export function updateProduct(id, updates) {
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  store.products[index] = { ...store.products[index], ...updates };
  return store.products[index];
}

export function deleteProduct(id) {
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.products.splice(index, 1);
  return true;
}

// ---- Categories ----

// categories.js static array ko seed ki tarah use karte hain (products jaisa
// hi pattern) — ab admin naye categories LIVE store mein add kar sakta hai
export function getAllCategories() {
  return store.categories;
}

export function addCategory(categoryData) {
  const newCategory = {
    id: String(Date.now()), // unique id — products jaisa hi pattern
    ...categoryData,
  };
  store.categories.push(newCategory);
  return newCategory;
}

// Category update — identity slug hai, isliye slug kabhi change NAHI hota
// (name/banner etc update ho sakte hain). Products ki category field isi
// slug se match hoti hai, isliye slug change karne se links toot jate.
export function updateCategory(slug, updates) {
  const index = store.categories.findIndex((c) => c.slug === slug);
  if (index === -1) return null;
  store.categories[index] = { ...store.categories[index], ...updates, slug };
  return store.categories[index];
}

export function deleteCategory(slug) {
  const index = store.categories.findIndex((c) => c.slug === slug);
  if (index === -1) return false;
  store.categories.splice(index, 1);
  return true;
}

// ---- Orders ----

export function getAllOrders() {
  return store.orders;
}

export function addOrder(orderData) {
  const newOrder = {
    id: "SIN-" + Math.floor(10000 + Math.random() * 90000),
    status: "Pending", // "Pending" | "Delivered"
    createdAt: new Date().toISOString(),
    ...orderData,
  };
  store.orders.push(newOrder);
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
}

// ---- Contact Messages ----

export function getAllContactMessages() {
  // Sabse naya message sabse upar
  return [...store.contactMessages].reverse();
}

export function addContactMessage(messageData) {
  const newMessage = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...messageData,
  };
  store.contactMessages.push(newMessage);
  return newMessage;
}
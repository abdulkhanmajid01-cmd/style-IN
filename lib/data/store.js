// lib/data/store.js
// PHASE 2 NOTE: Yeh ek in-memory store hai (server ki RAM mein data rehta
// hai) — server restart hone par sab changes reset ho jayenge. Yeh Phase 2
// ke liye theek hai (testing/demo), lekin Phase 3 mein iski jagah Prisma +
// real database (Supabase) le lega — is file ke functions ke NAAM same
// rakhenge (getAllProducts, addProduct, etc.) taake usay call karne wala
// code (API routes) zyada na badalna pade.

import { products as initialProducts } from "./products";

// Structured clone se ek "deep copy" banate hain — taake yeh mutable copy
// original products.js ke data ko touch na kare
let products = structuredClone(initialProducts);
let orders = [];

// ---- Products ----

export function getAllProducts() {
  return products;
}

// Storefront pages (Shop, Product detail) yeh function use karenge —
// products.js ke isi-naam function se alag hai kyunke yeh LIVE store
// (admin ke changes ke sath) se data deta hai, static file se nahi
export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(category) {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

export function addProduct(productData) {
  const newProduct = {
    id: String(Date.now()), // simple unique ID — Phase 3 mein database khud ID degi
    ...productData,
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(id, updates) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  return products[index];
}

export function deleteProduct(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

// ---- Orders ----

export function getAllOrders() {
  return orders;
}

export function addOrder(orderData) {
  const newOrder = {
    id: "SIN-" + Math.floor(10000 + Math.random() * 90000),
    status: "Pending", // "Pending" | "Delivered"
    createdAt: new Date().toISOString(),
    ...orderData,
  };
  orders.push(newOrder);
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
}

// ---- Contact Messages ----

let contactMessages = [];

export function getAllContactMessages() {
  // Sabse naya message sabse upar
  return [...contactMessages].reverse();
}

export function addContactMessage(messageData) {
  const newMessage = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...messageData,
  };
  contactMessages.push(newMessage);
  return newMessage;
}
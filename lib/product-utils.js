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
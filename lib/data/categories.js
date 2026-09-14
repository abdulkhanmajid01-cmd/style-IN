// lib/data/categories.js
// Phase 1: hardcoded array — Phase 3 mein yeh database (Category table) se
// aayega, jise admin panel ke "Categories" section se manage kiya jayega.
//
// IMPORTANT: Home page in categories ko LOOP karke banner sections banata
// hai — koi bhi naya category (jaise "Joggers") is array mein add hote hi
// khud-ba-khud apna banner + featured products dikhayega. Home page ka
// code kabhi category ke naam se hardcode nahi hota.

export const categories = [
  {
    slug: "bag", // yeh product.category field se match hota hai
    name: "Bags",
    bannerTitle: "BAGS",
    bannerSubtitle: "FLAT 30% OFF",
    // Phase 1: real photo nahi hai, isliye illustrated visual use hoga.
    // Phase 3 mein yeh field ek real image URL ban jayegi
    // (jaise "bannerImage: '/uploads/bags-banner.jpg'"), admin panel se upload hogi.
    visual: "bag",
  },
  {
    slug: "shoe",
    name: "Shoes",
    bannerTitle: "FOOTWEAR",
    bannerSubtitle: "FLAT 30% OFF",
    visual: "shoe",
  },
];

// Helper: slug se category dhoondne ke liye (CategoryBanner ko naam/text
// chahiye hoga jab wo kisi specific category ke liye render ho)
export function getCategoryBySlug(slug) {
  return categories.find((cat) => cat.slug === slug) || null;
}

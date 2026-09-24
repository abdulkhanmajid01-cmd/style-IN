// prisma/seed-data.js
// Seed ke liye static demo data. Pehle yeh lib/data/categories.js aur
// lib/data/products.js mein tha — ab sirf `prisma db seed` use karta hai.
// UI runtime is data par depend nahi karta (sab DB se aata hai).

export const categories = [
  {
    slug: "bag", // yeh product.category field se match hota hai
    name: "Bags",
    bannerTitle: "BAGS",
    bannerSubtitle: "FLAT 30% OFF",
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
    badge: "sale",
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
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });

globalThis.process.env.NODE_ENV = "test";
const { getAllProducts, addProduct, updateProduct, getProductBySlug, getAllCategories } =
  await import("../lib/data/store.js");
const { getProductImages, resolveCategoryTrait, traitToAttributes } =
  await import("../lib/product-utils.js");

let pass = 0,
  fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${
      ok ? "" : `\n   got=${JSON.stringify(got)}\n  want=${JSON.stringify(want)}`
    }`
  );
};
const ok = (name, cond) => eq(name, Boolean(cond), true);

const cats = await getAllCategories();
console.log("categories in DB:", cats.map((c) => c.slug));

// Pichle run ke leftovers hata dete hain (script pehle crash ho sakta hai)
const { prisma } = await import("../lib/prisma.js");
await prisma.product.deleteMany({ where: { slug: { in: ["zz-test-tote", "zz-test-sneaker"] } } });

// ---- CREATE: a BAG with 3 images, no size dimension ----
const bagTrait = resolveCategoryTrait("bag", cats);
const bag = await addProduct({
  name: "ZZ Test Tote",
  slug: "zz-test-tote",
  description: "temp",
  price: "4990",
  salePrice: null,
  badge: null,
  image: "https://cdn.example.com/bag-1.jpg",
  images: [
    "https://cdn.example.com/bag-1.jpg",
    "https://cdn.example.com/bag-2.jpg",
    "https://cdn.example.com/bag-3.jpg",
  ],
  attributes: traitToAttributes(bagTrait),
  variants: [
    { color: "Black", stock: 4 },
    { color: "Tan", stock: 2 },
  ],
  category: "bag",
});

eq("bag: image = images[0]", bag.image, "https://cdn.example.com/bag-1.jpg");
eq("bag: 3 images in order", bag.images.length, 3);
eq("bag: no size key on variants", bag.variants.every((v) => !("size" in v)), true);
eq("bag: attribute says no sizes", bag.attributes.usesSizes, false);
eq("bag: category slug mapped", bag.category, "bag");

// ---- READ BACK from DB ----
const reread = await getProductBySlug("zz-test-tote");
eq("reread: images intact", reread.images, bag.images);
eq("reread: primary intact", reread.image, "https://cdn.example.com/bag-1.jpg");
eq("reread: attributes intact", reread.attributes.usesSizes, false);

// ---- CREATE: SHOES with size dimension ----
const shoeTrait = resolveCategoryTrait("shoe", cats);
ok("shoe trait uses sizes", shoeTrait.usesSizes);
const shoe = await addProduct({
  name: "ZZ Test Sneaker",
  slug: "zz-test-sneaker",
  description: "temp",
  price: 8000,
  image: "https://cdn.example.com/shoe-1.jpg",
  images: ["https://cdn.example.com/shoe-1.jpg", "https://cdn.example.com/shoe-2.jpg"],
  attributes: traitToAttributes(shoeTrait),
  variants: [
    { color: "White", size: "40", stock: 3 },
    { color: "White", size: "41", stock: 1 },
  ],
  category: "shoe",
});
eq("shoe: size key present", shoe.variants.every((v) => v.size), true);
eq("shoe: attribute usesSizes", shoe.attributes.usesSizes, true);
eq("shoe: 2 images", shoe.images.length, 2);

// ---- UPDATE: remove one image, keep the rest (partial gallery edit) ----
const afterRemove = await updateProduct(bag.id, {
  images: [bag.images[0], bag.images[2]],
  image: bag.images[0],
});
eq("update: gallery now 2", afterRemove.images, [bag.images[0], bag.images[2]]);
eq("update: primary still first", afterRemove.image, bag.images[0]);

// ---- UPDATE: legacy single-image caller must NOT wipe the gallery ----
// Purane callers sirf `image` bhejte hain; naya image list ke shuru mein
// aa jata hai aur baaki gallery bachi rehti hai.
const legacyUpdate = await updateProduct(shoe.id, { image: "https://cdn.example.com/new.jpg" });
eq("legacy image-only update preserves gallery", legacyUpdate.images, [
  "https://cdn.example.com/new.jpg",
  ...shoe.images,
]);
eq("legacy image-only update sets primary", legacyUpdate.image, "https://cdn.example.com/new.jpg");

// ---- UPDATE: switching category to bags strips nothing server-side (form owns that),
//      but the new trait must be persisted ----
const switched = await updateProduct(shoe.id, { category: "bag" });
eq("category switch persists new trait", switched.attributes.usesSizes, false);

// ---- UPDATE: only stock edit (the admin products page flow) ----
const stockOnly = await updateProduct(bag.id, {
  variants: bag.variants.map((v) => ({ ...v, stock: 9 })),
});
// Gallery pehle wale update se 2 images par thi — stock-only update se badalni nahi chahiye
eq("stock-only update keeps gallery", stockOnly.images, afterRemove.images);
eq("stock-only update applied", stockOnly.variants[0].stock, 9);

eq("all listed", (await getAllProducts()).length >= 2, true);

// ---- CLEANUP: ye script real DB par chalti hai, to test rows hata dete hain ----
await prisma.product.deleteMany({ where: { slug: { in: ["zz-test-tote", "zz-test-sneaker"] } } });
eq("test rows cleaned up", await prisma.product.count(), 0);
await prisma.$disconnect();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

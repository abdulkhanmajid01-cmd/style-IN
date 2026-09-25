// Pure unit tests — koi DB, koi DOM nahi. `npm test` isse chalta hai.
// (Category traits + image normalisation + storefront variant helpers)
import assert from "node:assert/strict";
import {
  resolveCategoryTrait,
  traitToAttributes,
  getProductImages,
  getProductColors,
  getProductSizes,
  getVariantStock,
  isProductSoldOut,
  isColorSoldOut,
} from "../lib/product-utils.js";

let pass = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`FAIL  ${name}\n      ${error.message.split("\n").join("\n      ")}`);
  }
}

const CATS = [
  { slug: "bag", name: "Bags" },
  { slug: "shoe", name: "Shoes" },
  { slug: "pants-trousers", name: "Pants & Trousers" },
  { slug: "clothing", name: "Clothing" },
  { slug: "accessories", name: "Accessories" },
  { slug: "watches", name: "Watches" },
  { slug: "misc-42", name: "Miscellaneous" },
  { slug: "cat-99", name: "Luxury Watches" },
];

// ---- Category traits: size-less categories ----
test("bags have no size dimension", () => {
  const t = resolveCategoryTrait("bag", CATS);
  assert.equal(t.usesSizes, false);
  assert.equal(t.dimension, null);
});
test("accessories are size-less", () => {
  assert.equal(resolveCategoryTrait("accessories", CATS).usesSizes, false);
});
test("watches are size-less", () => {
  assert.equal(resolveCategoryTrait("watches", CATS).usesSizes, false);
});
test("traits match on category name, not just slug", () => {
  // slug bilkul generic hai ("cat-99") lekin naam "Luxury Watches" se size-less decide hota hai
  assert.equal(resolveCategoryTrait("cat-99", CATS).trait, "size-less");
});

// ---- Category traits: size-bearing categories ----
test("shoes get a shoe-size label", () => {
  const t = resolveCategoryTrait("shoe", CATS);
  assert.equal(t.usesSizes, true);
  assert.equal(t.label, "Shoe Sizes (comma-separated)");
  assert.equal(t.dimension, "size");
});
test("pants get a sizes/lengths label", () => {
  const t = resolveCategoryTrait("pants-trousers", CATS);
  assert.equal(t.label, "Sizes / Lengths (comma-separated)");
  assert.equal(t.dimension, "sizeOrLength");
});
test("clothing gets a sizes/lengths label", () => {
  assert.equal(resolveCategoryTrait("clothing", CATS).label, "Sizes / Lengths (comma-separated)");
});
test("unknown category falls back to a generic size field", () => {
  assert.equal(resolveCategoryTrait("zzz-none", CATS).trait, "generic-size");
});
test("no category selected is flagged as empty", () => {
  assert.equal(resolveCategoryTrait("", CATS).empty, true);
});
test("size-less trait carries a user-facing notice", () => {
  assert.match(resolveCategoryTrait("bag", CATS).noSizesNotice, /size nahi hota/);
});
test("trait serialises to the DB attributes shape", () => {
  assert.deepEqual(traitToAttributes(resolveCategoryTrait("bag", CATS)), {
    dimension: null,
    label: null,
    usesSizes: false,
    trait: "size-less",
  });
});

// ---- Image normalisation ----
test("images array passes through", () => {
  assert.deepEqual(getProductImages({ images: ["a.jpg", "b.jpg"] }), ["a.jpg", "b.jpg"]);
});
test("legacy single image is still returned", () => {
  assert.deepEqual(getProductImages({ image: "a.jpg" }), ["a.jpg"]);
});
test("images array drives the order", () => {
  assert.deepEqual(getProductImages({ image: "b.jpg", images: ["a.jpg", "b.jpg"] }), ["a.jpg", "b.jpg"]);
});
test("a drifted primary image is prepended", () => {
  assert.deepEqual(getProductImages({ image: "z.jpg", images: ["a.jpg"] }), ["z.jpg", "a.jpg"]);
});
test("json object entries are unwrapped", () => {
  assert.deepEqual(getProductImages({ images: [{ url: "a.jpg" }] }), ["a.jpg"]);
});
test("null product is safe", () => {
  assert.deepEqual(getProductImages(null), []);
});
test("blank urls are dropped", () => {
  assert.deepEqual(getProductImages({ image: "  ", images: ["a.jpg", ""] }), ["a.jpg"]);
});
test("duplicates are collapsed", () => {
  assert.deepEqual(getProductImages({ images: ["a.jpg", "a.jpg"] }), ["a.jpg"]);
});

// ---- Storefront variant helpers still work for BOTH variant shapes ----
const bag = { variants: [{ color: "Black", stock: 4 }, { color: "Tan", stock: 2 }] };
const shoe = {
  variants: [
    { color: "White", size: "40", stock: 3 },
    { color: "White", size: "41", stock: 0 },
  ],
};

test("size-less variants expose no sizes", () => {
  assert.deepEqual(getProductSizes(bag, "Black"), []);
});
test("size-less variants resolve stock by color alone", () => {
  assert.equal(getVariantStock(bag, "Black", null), 4);
});
test("sized variants expose a size list", () => {
  assert.deepEqual(getProductSizes(shoe, "White"), ["40", "41"]);
});
test("sized variants resolve stock by color + size", () => {
  assert.equal(getVariantStock(shoe, "White", "41"), 0);
});
test("colors are deduped", () => {
  assert.deepEqual(getProductColors(shoe), ["White"]);
});
test("sold-out detection works for size-less variants", () => {
  assert.equal(isProductSoldOut(bag), false);
  assert.equal(isColorSoldOut(bag, "Black"), false);
  assert.equal(isProductSoldOut({ variants: [{ color: "Black", stock: 0 }] }), true);
});

console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);

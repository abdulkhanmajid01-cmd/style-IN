// ProductForm ka DOM-level test suite.
//
// Node JSX nahi samajhta, is liye hum asli component source ko TypeScript se
// transpile karte hain aur use jsdom mein render karte hain. Ye test wahi
// component file test karta hai jo app chalti hai -- koi duplicate logic nahi.
//
// Is file ne ek asli regression bug pakda tha: category <select> mein koi
// placeholder option nahi tha. React `value=""` ko kisi option se match nahi
// kar sakta, is liye browser khud pehla option select kar deta tha. Admin ko
// dropdown "Bags" dikhta tha lekin formData.category khali rehta tha, aur
// submit "Name, price, and category are required." maar deta tha -- jabki
// name aur price bhari hui thi.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import ts from "typescript";

const root = process.cwd();
// Transpiled output node_modules ke andar: repo ke bahar rakhne par node
// ko `react` resolve nahi hota. node_modules already gitignored hai.
fs.mkdirSync(path.join(root, "node_modules", ".cache"), { recursive: true });
const OUT = fs.mkdtempSync(
  path.join(root, "node_modules", ".cache", "product-form-test-")
);
process.on("exit", () => fs.rmSync(OUT, { recursive: true, force: true }));

// ---- 1. Transpile the JSX modules we need into a temp dir ----

// next/link ko ek chhota stub se replace karte hain: ProductForm kabhi Button
// ko `href` nahi deta, to Link kabhi render hi nahi hota.
fs.writeFileSync(
  path.join(OUT, "next-link-stub.mjs"),
  "export default function Link({ children }) { return children; }\n"
);

// Alias target ko sahi extension ke saath dhoondo
const resolveAlias = (rel) => {
  const base = path.join(OUT, rel);
  for (const candidate of [`${base}.mjs`, base]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Alias target nahi mila: @/${rel}`);
};

// "@/..." alias ko absolute file URL mein badal dete hain (node ko jsconfig
// path alias samajh nahi aata).
const rewriteAlias = (code) =>
  code
    .replace(
      /from\s+"next\/link"/g,
      () => `from "${pathToFileURL(path.join(OUT, "next-link-stub.mjs")).href}"`
    )
    .replace(
      /from\s+"@\/([^"]+)"/g,
      (_m, rel) => `from "${pathToFileURL(resolveAlias(rel)).href}"`
    );

const MODULES = [
  "components/admin/ProductForm.jsx",
  "components/ui/Button.jsx",
  "lib/product-utils.js",
  "lib/slugify.js",
];

// Do passes zaroori hain: alias rewrite un files ko dhoondta hai jo doosre
// module import karte hain, is liye pehle sab compile karo.
const emitted = new Map();
for (const rel of MODULES) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, rel), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: "ES2022" },
  });
  const dest = path.join(OUT, rel.replace(/\.jsx?$/, ".mjs"));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, outputText);
  emitted.set(dest, outputText);
}
for (const [dest, code] of emitted) fs.writeFileSync(dest, rewriteAlias(code));

// ---- 2. jsdom + React ----
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/admin/products",
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.File = dom.window.File;
global.FormData = dom.window.FormData;
global.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import("react")).default;
const { createRoot } = await import("react-dom/client");
const act = React.act;
const ProductForm = (
  await import(pathToFileURL(path.join(OUT, "components/admin/ProductForm.mjs")).href)
).default;

const CATEGORIES = [
  { slug: "bag", name: "Bags" },
  { slug: "shoe", name: "Shoes" },
  { slug: "pants-trousers", name: "Pants & Trousers" },
];

let pass = 0;
const failures = [];
function eq(name, got, want) {
  try {
    assert.deepEqual(got, want);
    pass++;
    console.log(`PASS  ${name}`);
  } catch {
    failures.push(name);
    console.log(
      `FAIL  ${name}\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`
    );
  }
}
function check(condition, message) {
  if (!condition) throw new Error(message);
}

// ---- helpers ----
async function render() {
  // Har test fresh fetch mock ke saath shuru ho, warna pichle test ka mock
  // leak hokar categories load fail kar deta hai.
  global.fetch = async (url) =>
    String(url).includes("/api/admin/categories")
      ? { ok: true, json: async () => CATEGORIES }
      : { ok: true, json: async () => ({}) };

  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(ProductForm, { onSaved() {}, onCancel() {} }));
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20)); // categories fetch settle
  });
  return { container, unmount: () => act(async () => root.unmount()) };
}

const $ = (container, sel) => container.querySelector(sel);
const $$ = (container, sel) => [...container.querySelectorAll(sel)];

// React 18 state updates batch karta hai, is liye har change ko act() mein
// wrap karna zaroori hai, warna assertions stale DOM par padhte hain.
async function setInput(el, value) {
  if (!el) throw new Error(`setInput: element nahi mila for "${value}"`);
  const proto =
    el.tagName === "SELECT"
      ? dom.window.HTMLSelectElement.prototype
      : el.tagName === "TEXTAREA"
        ? dom.window.HTMLTextAreaElement.prototype
        : dom.window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
}

// <label> text se uske baad wala control dhoondho (beech ke <p> hint skip karte hain)
function controlAfterLabel(container, labelText) {
  const label = $$(container, "label").find((n) => n.textContent.trim().startsWith(labelText));
  if (!label) return null;
  let el = label.nextElementSibling;
  while (el && el.tagName === "P") el = el.nextElementSibling;
  return el;
}

async function submit(container) {
  await act(async () => {
    container
      .querySelector("form")
      .dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
  });
}

const errorText = (container) => container.querySelector(".field-error")?.textContent ?? null;

/** Submit payload capture karne wala fetch mock */
function captureSubmit() {
  const state = { payload: null };
  global.fetch = async (url, init) => {
    state.payload = JSON.parse(init.body);
    return { ok: true, json: async () => ({}) };
  };
  return state;
}

// =====================================================================
// 1. THE REGRESSION: puri tarah bhara form submit hona chahiye
// =====================================================================
{
  const { container, unmount } = await render();
  const categorySelect = $$(container, "select").find((s) => s.querySelector('option[value="bag"]'));

  eq("category dropdown ne options load kiye", categorySelect.querySelectorAll("option").length > 1, true);
  // Yeh placeholder hi asli bug ka fix hai: UI aur state ab match karte hain
  eq("category select mein empty placeholder hai", categorySelect.querySelector('option[value=""]') !== null, true);

  await setInput($(container, 'input[name="name"]'), "Leather Tote");
  await setInput($(container, 'input[name="price"]'), "4990");
  await setInput($(container, "select[name=category]"), "bag");
  await setInput(controlAfterLabel(container, "Colors"), "Black, Tan");

  const capture = captureSubmit();
  await submit(container);

  eq("validation ne form block nahi kiya", capture.payload !== null, true);
  eq("koi error nahi dikha", errorText(container), null);
  if (capture.payload) {
    eq("name payload mein gaya", capture.payload.name, "Leather Tote");
    eq("category slug payload mein gayi", capture.payload.category, "bag");
    eq("price number bani", capture.payload.price, 4990);
  }
  await unmount();
}

// =====================================================================
// 2. Empty form aur genuinely missing fields abhi bhi block hone chahiye
// =====================================================================
{
  const { container, unmount } = await render();
  const capture = captureSubmit();
  await submit(container);
  eq("khali form block hui", capture.payload, null);
  check(/name/i.test(errorText(container) ?? ""), "error mein name ka mention hona chahiye");
  pass++;
  console.log("PASS  error message mentions the missing name");
  await unmount();
}

// =====================================================================
// 3. Dynamic Sizes field — category se label aur visibility badalti hai
// =====================================================================
{
  const { container, unmount } = await render();
  const sizeBlock = () => {
    const label = $$(container, "label").find((n) => /Size/i.test(n.textContent));
    if (!label) return null;
    let el = label.nextElementSibling;
    while (el && el.tagName === "P") el = el.nextElementSibling;
    return { label: label.textContent, input: el };
  };

  eq("category chune se pehle generic size label", sizeBlock()?.label, "Sizes (comma-separated, optional)");

  await setInput($(container, "select[name=category]"), "bag");
  eq("bags: sizes input disabled", sizeBlock().input.disabled, true);
  eq("bags: disabled placeholder", sizeBlock().input.placeholder, "Not applicable for this category");
  check(/size nahi hota/.test(container.textContent), "admin ko explain karna chahiye");
  pass++;
  console.log("PASS  bags: hint explains why sizes are hidden");

  await setInput($(container, "select[name=category]"), "pants-trousers");
  eq("pants: sizes input enabled", sizeBlock().input.disabled, false);
  eq("pants: label", sizeBlock().label, "Sizes / Lengths (comma-separated)");

  await setInput($(container, "select[name=category]"), "shoe");
  eq("shoe: label", sizeBlock().label, "Shoe Sizes (comma-separated)");
  await unmount();
}

// =====================================================================
// 4. Variants JSON category ke mutabiq banta hai
// =====================================================================
{
  const { container, unmount } = await render();
  const capture = captureSubmit();

  await setInput($(container, 'input[name="name"]'), "Test Bag");
  await setInput($(container, 'input[name="price"]'), "4990");
  await setInput($(container, "select[name=category]"), "bag");
  await setInput(controlAfterLabel(container, "Colors"), "Black, Tan");
  await submit(container);

  const bagVariants = capture.payload?.variants ?? [];
  eq("bag variants mein 'size' key hi nahi", bagVariants.every((v) => !("size" in v)), true);
  eq("bag: ek variant per color", bagVariants.length, 2);
  eq("bag: colors title-cased", bagVariants.map((v) => v.color), ["Black", "Tan"]);
  eq("bag: attributes says no sizes", capture.payload?.attributes.usesSizes, false);
  eq("bag: attributes dimension null", capture.payload?.attributes.dimension, null);

  await setInput($(container, "select[name=category]"), "pants-trousers");
  await setInput(controlAfterLabel(container, "Colors"), "Blue");
  await setInput(controlAfterLabel(container, "Sizes / Lengths"), "32, 40in");
  await submit(container);

  eq("pants: color x size cartesian", capture.payload?.variants, [
    { color: "Blue", size: "32", stock: 5 },
    { color: "Blue", size: "40in", stock: 5 },
  ]);
  eq("pants: attributes dimension", capture.payload?.attributes.dimension, "sizeOrLength");
  eq("pants: attributes usesSizes", capture.payload?.attributes.usesSizes, true);

  // Category wapas bag par: 'size' key phir se hat jaani chahiye
  await setInput($(container, "select[name=category]"), "bag");
  await submit(container);
  eq("pants se bag switch: 'size' key hat gayi", (capture.payload?.variants ?? []).every((v) => !("size" in v)), true);
  await unmount();
}

// =====================================================================
// 5. Multiple images
// =====================================================================
{
  const { container, unmount } = await render();
  const fileInput = $(container, 'input[type="file"]');
  eq("file input multiple accept karta hai", fileInput.multiple, true);

  const makeFile = (name) => new dom.window.File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });
  Object.defineProperty(fileInput, "files", {
    configurable: true,
    value: [makeFile("a.png"), makeFile("b.png"), makeFile("c.png")],
  });

  // Upload route ab array of URLs wapas bhejta hai
  global.fetch = async (url, init) => {
    const sent = init.body.getAll("files");
    return {
      ok: true,
      json: async () => ({
        urls: sent.map((_, i) => `https://cdn.test/${i}.png`),
        url: "https://cdn.test/0.png",
      }),
    };
  };
  await act(async () => {
    fileInput.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
  });

  eq("teen thumbnails render hui", container.querySelectorAll(".admin-image-thumb").length, 3);
  eq("sirf pehli image 'Main' hai", container.querySelectorAll(".admin-image-badge").length, 1);

  // "Make main" se primary badalna
  await act(async () => {
    $$(
      container,
      ".admin-image-actions button"
    ).find((b) => b.textContent.includes("Make main")).click();
  });
  eq("Make main: thumbnail order badli", $$(
    container,
    ".admin-image-thumb img"
  ).map((i) => i.getAttribute("src")), ["https://cdn.test/1.png", "https://cdn.test/0.png", "https://cdn.test/2.png"]);

  const capture = captureSubmit();
  await setInput($(container, 'input[name="name"]'), "Gallery Bag");
  await setInput($(container, 'input[name="price"]'), "1000");
  await setInput($(container, "select[name=category]"), "bag");
  await setInput(controlAfterLabel(container, "Colors"), "Black");
  await submit(container);

  eq("images array payload mein gayi", capture.payload?.images, [
    "https://cdn.test/1.png",
    "https://cdn.test/0.png",
    "https://cdn.test/2.png",
  ]);
  eq("primary image = pehli image", capture.payload?.image, "https://cdn.test/1.png");

  // Remove button
  await act(async () => {
    $$(
      container,
      ".admin-image-actions button"
    ).find((b) => b.textContent === "Remove").click();
  });
  eq("remove thumbnail hataya", container.querySelectorAll(".admin-image-thumb").length, 2);
  await unmount();
}

// =====================================================================
// 6. Sale price validation
// =====================================================================
{
  const { container, unmount } = await render();
  const capture = captureSubmit();
  await setInput($(container, 'input[name="name"]'), "X");
  await setInput($(container, 'input[name="price"]'), "1000");
  await setInput($(container, "select[name=category]"), "bag");
  await setInput(controlAfterLabel(container, "Colors"), "Black");
  await setInput($(container, 'input[name="salePrice"]'), "1500");
  await submit(container);
  eq("sale >= regular block hui", capture.payload, null);
  check(/kam honi chahiye/.test(errorText(container) ?? ""), "sale price error aana chahiye");
  pass++;
  console.log("PASS  sale price error message shown");
  await unmount();
}

// =====================================================================
// 7. Whitespace-only name aur non-numeric price bhi reject hone chahiye
// (purana `!value` check inhe "bhara hua" maan leta tha)
// =====================================================================
{
  const { container, unmount } = await render();
  const capture = captureSubmit();
  await setInput($(container, 'input[name="name"]'), "   ");
  await setInput($(container, 'input[name="price"]'), "1000");
  await setInput($(container, "select[name=category]"), "bag");
  await setInput(controlAfterLabel(container, "Colors"), "Black");
  await submit(container);
  eq("whitespace-only name block hui", capture.payload, null);
  check(/name is required/i.test(errorText(container) ?? ""), "name required error aana chahiye");
  pass++;
  console.log("PASS  whitespace-only name rejected");
  await unmount();
}

console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);

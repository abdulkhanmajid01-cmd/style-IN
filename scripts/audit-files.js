// scripts/audit-files.js
// Yeh script sirf CHECK karti hai — koi file banati/badalti nahi.
// Expected files ki list ke against, batati hai kaunsi missing hain.

const fs = require("fs");
const path = require("path");

const expectedFiles = [
  "README.md",
  "app/about/page.jsx",
  "app/admin/login/page.jsx",
  "app/admin/messages/page.jsx",
  "app/admin/orders/page.jsx",
  "app/admin/page.jsx",
  "app/admin/products/page.jsx",
  "app/api/admin/login/route.js",
  "app/api/admin/logout/route.js",
  "app/api/admin/messages/route.js",
  "app/api/admin/orders/route.js",
  "app/api/admin/products/route.js",
  "app/api/contact/route.js",
  "app/api/orders/route.js",
  "app/api/products/[slug]/route.js",
  "app/api/products/route.js",
  "app/checkout/page.jsx",
  "app/contact/page.jsx",
  "app/globals.css",
  "app/layout.jsx",
  "app/not-found.jsx",
  "app/order-confirmation/[id]/page.jsx",
  "app/page.jsx",
  "app/product/[slug]/page.jsx",
  "app/shop/page.jsx",
  "components/CartDrawer.jsx",
  "components/CartIcon.jsx",
  "components/CategoryBanner.jsx",
  "components/CategoryVisual.jsx",
  "components/CheckoutForm.jsx",
  "components/Footer.jsx",
  "components/Header.jsx",
  "components/Hero.jsx",
  "components/ProductCard.jsx",
  "components/ProductGrid.jsx",
  "components/admin/LogoutButton.jsx",
  "components/admin/ProductForm.jsx",
  "components/ui/AccordionSection.jsx",
  "components/ui/Badge.jsx",
  "components/ui/Button.jsx",
  "components/ui/PriceTag.jsx",
  "context/CartContext.jsx",
  "jsconfig.json",
  "lib/auth.js",
  "lib/product-utils.js",
  "lib/data/store.js",
  "lib/slugify.js",
  "middleware.js",
  "next.config.js",
  "package.json",
  "prisma/seed-data.js",
];

console.log("\n🔍 Style-IN Project File Audit\n");

let missingCount = 0;
let emptyCount = 0;

for (const file of expectedFiles) {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ MISSING:  ${file}`);
    missingCount++;
    continue;
  }

  const stats = fs.statSync(fullPath);
  if (stats.size === 0) {
    console.log(`⚠️  EMPTY:    ${file}`);
    emptyCount++;
  }
}

console.log("\n----------------------------------------");
if (missingCount === 0 && emptyCount === 0) {
  console.log(`✅ All ${expectedFiles.length} files present and non-empty!`);
} else {
  console.log(`Total: ${expectedFiles.length} | Missing: ${missingCount} | Empty: ${emptyCount}`);
}
console.log("----------------------------------------\n");
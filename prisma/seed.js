// prisma/seed.js — Dev database ko seed data se fill karta hai.
//
// Data source: lib/data/ ke existing hardcoded mock arrays (Phase 1/2 ke
// seed) — wohi products aur categories database mein lag jate hain taake
// frontend/backend wahi data dikhaye jo pehle dikhte the.
//
// NOTE: Yeh file plain Node (CommonJS) mein chalti hai — is liye require()
// use kiya hai, ESM import nahi. Env vars (.env.local) khud load karte
// hain kyunke Prisma CLI seed process ko env pass nahi karta.
//
// Prisma 7 adapter pattern: @prisma/adapter-pg + pg pool (lib/prisma.js jaisa).

const { config } = require("dotenv");
config({ path: ".env.local", override: true });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const { categories, products } = require("./seed-data.js");

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Seeding database...");

  // Purana data clear karo — FK order mein delete karo (OrderItem dono
  // Order aur Product ko reference karta hai, isliye sabse pehle).
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.loginAttempt.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  // Categories insert karo — id capture karte hain slug ke against,
  // taake products isi id se link ho sakein (Product.categoryId).
  const categoryIdBySlug = {};
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        imageUrl: category.bannerImage || null,
        bannerTitle: category.bannerTitle || null,
        bannerSubtitle: category.bannerSubtitle || null,
        visual: category.visual || null,
      },
    });
    categoryIdBySlug[category.slug] = created.id;
    console.log(`  ✅ Category: ${category.name} (${category.slug})`);
  }

  // Products insert karo. Data ke fields → schema mapping:
  //   badge      → persist karte hain ("new"/"sale") — UI corner badge wapas
  //   image      → data mein null hai (Phase 1 mein line-art icons the)
  //   variants   → Json field mein poora array store kiya jata hai
  //   isFeatured → kuch products featured mark hain — Home page ka "New this
  //                week" section isi flag se query karta hai
  const featuredSlugs = [
    "the-everyday-tote",
    "classic-block-heels",
    "mini-crossbody",
    "retro-chunky-sneakers",
  ];
  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        salePrice: product.salePrice != null ? Number(product.salePrice) : null,
        badge: product.badge || null,
        image: product.image || null,
        isFeatured: featuredSlugs.includes(product.slug),
        categoryId: categoryIdBySlug[product.category],
        variants: product.variants,
      },
    });
    console.log(`  ✅ Product: ${product.name} (${product.slug})`);
  }

  await prisma.$disconnect();
  console.log("Done! Database seeded.");
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
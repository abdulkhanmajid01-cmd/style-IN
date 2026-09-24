// page.jsx (Home) — Server Component hai (koi "use client" nahi). Yeh sirf
// data (products) leta hai aur components ko assemble karta hai — khud koi
// state/interactivity nahi rakhta. Andar jo client components hain
// (Hero, ProductGrid → ProductCard) woh apna "use client" khud carry karte hain.

import Link from "next/link";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import CategoryBanner from "@/components/CategoryBanner";
import Button from "@/components/ui/Button";
import {
  getFeaturedProducts,
  getProductsByBadge,
  getProductsByCategory,
  getAllCategories,
} from "@/lib/data/store";

// Yeh page store se directly padhta hai (admin ke live changes ke liye) —
// is liye force-dynamic: warna Next.js 14 build-time par isay static
// prerender kar deta aur runtime ke naye categories home par kabhi na dikhte
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Sab data live DB queries se — isFeatured=true featured section, badge
  // "sale" sale section. Hardcoded slices/products ab nahi hain.
  const [featuredProducts, saleProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getProductsByBadge("sale"),
    getAllCategories(),
  ]);

  const categorySections = await Promise.all(
    categories.map(async (category) => ({
      category,
      categoryProducts: await getProductsByCategory(category.slug),
    }))
  );

  return (
    <>
      <Hero />

      {/* Category banners — live store ke categories array ko LOOP kar rahe
          hain. Admin naya category add karte hi (chahe "Joggers" ho) yahan
          khud apna banner + featured products ke sath aa jayega, code
          chedne ki zaroorat nahi. */}
      <section className="section-tight">
        <div className="wrap">
          {categorySections.map(({ category, categoryProducts }) => {
            return (
              <div key={category.slug} style={{ marginBottom: 56 }}>
                <CategoryBanner category={category} productCount={categoryProducts.length} />
                <ProductGrid products={categoryProducts.slice(0, 4)} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured products — isFeatured: true (admin panel se toggle hota hai) */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>New this week</h2>
            <Link href="/shop" className="section-link">
              View all products
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Sale products — badge === "sale" (DB se, live) */}
      {saleProducts.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>On Sale</h2>
              <Link href="/shop?category=bag" className="section-link">
                Shop the Sale
              </Link>
            </div>
            <ProductGrid products={saleProducts} />
          </div>
        </section>
      )}

      {/* Promo strip */}
      <div className="promo">
        <div className="wrap">
          <div>
            <h3>The Weekend Edit — Flat 30% off all bags</h3>
            <p>Ends Sunday midnight. Applied automatically at checkout.</p>
          </div>
          <Button href="/shop?category=bag" variant="outline-dark">
            Shop Bags
          </Button>
        </div>
      </div>

      {/* Editorial split */}
      <section className="section">
        <div className="wrap split">
          <div className="split-copy">
            <div className="kicker">Why Style-IN</div>
            <h2>Built to keep up with your week</h2>
            <p>
              We test every strap, sole and zip against the things that
              actually wear them out — rickshaws, staircases, overstuffed
              desks. If it survives a Style-IN team member&apos;s commute, it
              goes into the shop.
            </p>
            <p>
              Every piece ships with a 7-day exchange window, because photos
              on a screen never quite match the real thing.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>60+</b>
                <span>Styles in rotation</span>
              </div>
              <div className="stat">
                <b>7 days</b>
                <span>Easy exchange</span>
              </div>
              <div className="stat">
                <b>COD</b>
                <span>Nationwide delivery</span>
              </div>
            </div>
          </div>
          <div className="split-art">
            <svg viewBox="0 0 200 200" fill="none" stroke="#7c5636" strokeWidth="2">
              <rect x="40" y="40" width="120" height="120" rx="8" />
              <path d="M40 90 h120 M90 40 v120" strokeDasharray="4 5" />
              <circle cx="65" cy="65" r="4" fill="#7c5636" stroke="none" />
              <circle cx="135" cy="65" r="4" fill="#7c5636" stroke="none" />
              <circle cx="65" cy="135" r="4" fill="#7c5636" stroke="none" />
              <circle cx="135" cy="135" r="4" fill="#7c5636" stroke="none" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
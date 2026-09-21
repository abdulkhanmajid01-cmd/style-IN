// CategoryBanner.jsx — Server Component (koi "use client" nahi). Arrow
// hover animation CSS transition se hoti hai (globals.css), isliye koi
// client-side JS state ki zaroorat nahi — yeh performance ke liye behtar hai.

import Link from "next/link";

// Bags aur Shoes (aur kal koi bhi naya category) ke liye bada illustrated
// visual — Phase 1 mein real photo nahi hai, isliye line-art icon ko bada
// karke banner jaisa bana rahe hain. Phase 3 mein yeh function delete ho
// jayega aur seedha <img src={category.bannerImage}> use hoga.
const CATEGORY_VISUAL = {
  bag: (
    <svg viewBox="0 0 300 260" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M105 110 L105 85 Q105 45 150 45 Q195 45 195 85 L195 110" />
      <rect x="75" y="110" width="150" height="120" rx="12" />
      <line x1="75" y1="145" x2="225" y2="145" />
      <circle cx="150" cy="175" r="8" />
    </svg>
  ),
  shoe: (
    <svg viewBox="0 0 300 260" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M50 160 Q50 135 75 125 L145 100 Q165 92 165 115 L165 145 Q195 145 202 175 Q210 205 178 210 L62 210 Q42 210 42 190 Q42 172 50 160 Z" />
      <path d="M75 125 L75 150" />
    </svg>
  ),
};

// category: { slug, name, bannerTitle, bannerSubtitle, bannerImage, visual }
// bannerImage: agar admin ne upload ki ho (admin panel se) to woh <img> se
// dikhegi — warna niche wala line-art icon (CATEGORY_VISUAL[visual]) fallback
// hai, bilkul CategoryVisual.jsx walay pattern ki tarah
// productCount: total kitne products is category mein hain — "View All" sirf
// tab dikhega jab products ek chhote grid se zyada hon
export default function CategoryBanner({ category, productCount = 0 }) {
  const showViewAll = productCount > 4; // agar 4 se kam hon to sab already grid mein dikh jate hain

  return (
    <div className={`category-banner cb-${category.visual}`}>
      <div className="cb-visual">
        {category.bannerImage ? (
          <img src={category.bannerImage} alt={category.name} className="cb-visual-image" />
        ) : (
          CATEGORY_VISUAL[category.visual]
        )}
      </div>

      <div className="cb-text">
        <h2>{category.bannerTitle}</h2>
        <p>{category.bannerSubtitle}</p>
      </div>

      {showViewAll && (
        <Link href={`/shop?category=${category.slug}`} className="cb-viewall">
          <span>View All</span>
          {/* Arrow ka movement globals.css mein CSS transition se hota hai
              (.cb-viewall:hover .cb-arrow) — poore link ko hover karne par
              trigger hota hai, sirf arrow ko hover karne se nahi */}
          <span className="cb-arrow">→</span>
        </Link>
      )}
    </div>
  );
}

// CategoryVisual.jsx — Server Component (koi "use client" nahi, koi
// interactivity nahi). Yeh sirf ek visual box banata hai jisme category ke
// hisaab se line-art icon hota hai.
//
// IMPORTANT: Yeh Phase 1 ka temporary placeholder hai (real product photos
// nahi hain abhi). Phase 3 mein jab admin panel se real image upload hogi,
// tab sirf is EK file ko update karna hoga (<img src={product.image}> se
// replace karna) — ProductCard ya product detail page ko chedna nahi parega,
// kyunke dono is component ko import karte hain, khud icon nahi banate.

const ICONS = {
  bag: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M28 38 L28 30 Q28 16 50 16 Q72 16 72 30 L72 38" />
      <rect x="18" y="38" width="64" height="50" rx="6" />
      <line x1="18" y1="55" x2="82" y2="55" />
    </svg>
  ),
  shoe: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M20 55 Q20 45 30 42 L52 36 Q60 33 60 42 L60 52 Q75 52 78 65 Q80 76 68 78 L22 78 Q15 78 15 70 Q15 60 20 55 Z" />
      <path d="M30 42 L30 54" />
    </svg>
  ),
};

// Product id se ek consistent (hamesha wahi) background shade choose karta
// hai — 5 halke shades (pv-1 se pv-5) globals.css mein already defined hain.
function getVisualClass(id) {
  const index = (Number(id) % 5) + 1;
  return `pv-${index}`;
}

// size: "card" (default, chhota — grid mein) | "detail" (bada — product page par)
// children: optional — jaise <Badge>, jo box ke andar top-left corner mein
// position hota hai (CSS ".product-visual" par position:relative hai,
// isliye Badge ko yahi ke andar hona chahiye taake positioning sahi rahe)
export default function CategoryVisual({ id, category, size = "card", children }) {
  const sizeClass = size === "detail" ? "product-visual-lg" : "";
  return (
    <div className={`product-visual ${getVisualClass(id)} ${sizeClass}`}>
      {children}
      {ICONS[category]}
    </div>
  );
}

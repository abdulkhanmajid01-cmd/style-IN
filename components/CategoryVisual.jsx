// CategoryVisual.jsx — Server Component (koi "use client" nahi, koi
// interactivity nahi). Yeh sirf ek visual box banata hai jisme category ke
// hisaab se line-art icon hota hai.

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

function getVisualClass(id) {
  const index = (Number(id) % 5) + 1;
  return `pv-${index}`;
}

// size: "card" (default, chhota — grid mein) | "detail" (bada — product page par)
// image: optional — agar admin ne real photo upload ki ho to woh dikhegi,
// warna niche wala line-art icon fallback ban jata hai
// children: optional — jaise <Badge>, jo box ke andar top-left corner mein
// position hota hai
export default function CategoryVisual({ id, category, size = "card", image, children }) {
  const sizeClass = size === "detail" ? "product-visual-lg" : "";
  return (
    <div className={`product-visual ${getVisualClass(id)} ${sizeClass}`}>
      {children}
      {image ? (
        <img src={image} alt="" className="product-visual-image" />
      ) : (
        ICONS[category]
      )}
    </div>
  );
}
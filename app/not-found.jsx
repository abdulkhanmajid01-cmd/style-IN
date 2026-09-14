// not-found.jsx — Next.js ka special file naam hai. Yeh automatically tab
// dikhta hai jab: 1) koi notFound() call kare (jaise product/[slug] page
// mein), ya 2) user koi aisa URL kholay jo kisi route se match hi na ho.
// Koi "use client" nahi chahiye — sirf static friendly message + links hai.

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="wrap not-found-inner">
        <svg viewBox="0 0 200 160" fill="none" stroke="#7c5636" strokeWidth="2">
          <rect x="55" y="55" width="90" height="80" rx="10" />
          <path d="M75 55 L75 40 Q75 20 100 20 Q125 20 125 40 L125 55" />
          <line x1="75" y1="90" x2="125" y2="90" />
          {/* "?" jaisa ek chhota sa question mark bag ke andar — playful touch */}
          <text x="100" y="118" fontSize="34" fill="#7c5636" stroke="none" textAnchor="middle" fontFamily="sans-serif">?</text>
        </svg>

        <h1>We looked everywhere — this page isn&apos;t here.</h1>
        <p>
          The page you&apos;re after might have moved, or the link may be
          outdated. Let&apos;s get you back to browsing.
        </p>

        <div className="not-found-actions">
          <Button href="/">Back to Home</Button>
          <Button href="/shop" variant="outline">
            Continue Shopping
          </Button>
        </div>

        <p className="not-found-help">
          Still stuck?{" "}
          <Link href="/contact">Contact us</Link> and we&apos;ll sort it out.
        </p>
      </div>
    </section>
  );
}

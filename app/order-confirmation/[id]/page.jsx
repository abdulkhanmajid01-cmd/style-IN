// order-confirmation/[id]/page.jsx — Server Component (koi "use client"
// nahi), kyunke yeh sirf URL se order ID leta hai aur static content dikhata
// hai, koi interactivity nahi. "params" Next.js khud resolve karke deta hai.
//
// PHASE 1 note: abhi order ID sirf checkout page ne generate kiya tha
// (real database entry nahi hai) — is wajah se agar koi bhi random ID
// wala URL type kare (jaise /order-confirmation/kuch-bhi), yeh page phir
// bhi dikhega. PHASE 3 mein hum database se check karenge ke yeh order
// ID asal mein exist karta hai ya nahi — agar na kare to notFound() call
// karenge (product page jaisa).

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrderConfirmationPage({ params }) {
  const orderId = params.id;

  return (
    <section className="section">
      <div className="wrap not-found-inner">
        {/* Tick/checkmark icon — success feel dene ke liye */}
        <svg viewBox="0 0 100 100" fill="none" stroke="#7c5636" strokeWidth="3">
          <circle cx="50" cy="50" r="38" />
          <path d="M32 52 L44 64 L70 36" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1>Order placed!</h1>
        <p>
          Thanks — your order <strong>#{orderId}</strong> has been received.
          We&apos;ll call you shortly to confirm your Cash on Delivery order.
        </p>

        <div className="not-found-actions">
          <Button href="/">Back to Home</Button>
          <Button href="/shop" variant="outline">
            Continue Shopping
          </Button>
        </div>

        <p className="not-found-help">
          Questions about your order?{" "}
          <Link href="/contact">Contact us</Link> with your order number.
        </p>
      </div>
    </section>
  );
}

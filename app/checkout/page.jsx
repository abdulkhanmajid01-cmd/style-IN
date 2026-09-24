"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/CheckoutForm";
import PriceTag from "@/components/ui/PriceTag";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // CheckoutForm khud validation kar chuka hota hai — yahan sirf order
  // ko backend tak pahunchana hai
  async function handlePlaceOrder(formData) {
    setIsSubmitting(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData, // fullName, email, phone, whatsapp, address, city
        items,
        totalPrice,
      }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    // Server ne real order banaya — usi ka ID use karenge (fake ID ab nahi banate)
    const order = await res.json();
    clearCart();
    router.push(`/order-confirmation/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="wrap" style={{ textAlign: "center", padding: "60px 0" }}>
          <h1>Your bag is empty</h1>
          <p style={{ color: "var(--grey)", margin: "12px 0 24px" }}>
            Add something to your bag before checking out.
          </p>
          <Button href="/shop">Continue Shopping</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / Checkout
          </div>
          <h1>Checkout</h1>
        </div>
      </div>

      <section className="section">
        <div className="wrap contact-grid">
          <div>
            <CheckoutForm onSubmit={handlePlaceOrder} isSubmitting={isSubmitting} />
            {/* Server-side error (jaise network fail) yahan dikhta hai — form
                ke apne field errors se alag, is wajah se yahan bahar rakha */}
            {error && <p className="field-error" style={{ marginTop: 12 }}>{error}</p>}
          </div>

          <div>
            <div className="contact-info-card">
              <h3>Order Summary</h3>
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}
                >
                  <span style={{ fontSize: 13.5 }}>
                    {item.name}
                    {(item.color || item.size) && (
                      <span style={{ opacity: 0.7 }}>
                        {" "}
                        — {[item.color, item.size].filter(Boolean).join(", ")}
                      </span>
                    )}{" "}
                    × {item.quantity}
                  </span>
                  <span style={{ fontSize: 13.5 }}>
                    <PriceTag price={item.price * item.quantity} />
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  borderTop: "1px solid var(--line)",
                  paddingTop: 14,
                  marginTop: 6,
                }}
              >
                <span>Total</span>
                <PriceTag price={totalPrice} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
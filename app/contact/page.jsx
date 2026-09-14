"use client";
// "use client" zaroori hai — form ka useState (name/email/message + submitted
// status) client-side hai.

import { useState } from "react";
import Button from "@/components/ui/Button";
import AccordionSection from "@/components/ui/AccordionSection";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "2–3 working days for Lahore, Karachi and Islamabad. 4–6 working days for other cities. You'll get a tracking link by SMS once it ships.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, COD is available nationwide with no extra charge. You can also pay online by card at checkout if you'd prefer.",
  },
  {
    q: "What's your exchange policy?",
    a: "Any unworn item can be exchanged within 7 days of delivery. Message us on WhatsApp with your order number and we'll arrange a pickup.",
  },
  {
    q: "How do I know what size to order?",
    a: "Each shoe listing includes a size guide with measurements. If you're between sizes, we recommend sizing up.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", order: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  // Phase 1: sirf local success state dikhata hai. Phase 2 mein yeh function
  // /api/contact ko real POST request bhejega — form ka JSX badalne ki
  // zaroorat nahi hogi, sirf yeh function update hoga.
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", order: "", message: "" });
  }

  return (
    <>
      <div className="page-header">
        <div className="wrap">
          <div className="crumb">Home / Contact</div>
          <h1>Talk to us</h1>
          <p>
            Order questions, sizing, exchanges, or just want to say hi — the
            fastest way to reach us is WhatsApp, but the form works too.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="wrap contact-grid">
          <div>
            {submitted ? (
              // Submit hone ke baad form ki jagah ek confirmation dikhate hain
              <div className="cart-empty" style={{ alignItems: "flex-start", padding: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--black)" }}>
                  Thanks — we&apos;ll get back to you soon.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
                <div className="form-field">
                  <label htmlFor="order">Order number (optional)</label>
                  <input id="order" value={formData.order} onChange={handleChange} placeholder="e.g. SIN-10482" />
                </div>
                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" value={formData.message} onChange={handleChange} placeholder="How can we help?" required />
                </div>
                <Button type="submit" fullWidth>
                  Send Message
                </Button>
              </form>
            )}
          </div>

          <div>
            <div className="contact-info-card">
              <h3>Reach us directly</h3>
              <div className="info-line">
                <div>
                  <strong>WhatsApp & Phone</strong>
                  <span>+92 300 1234567 — 10am to 8pm, daily</span>
                </div>
              </div>
              <div className="info-line">
                <div>
                  <strong>Email</strong>
                  <span>hello@style-in.pk</span>
                </div>
              </div>
              <div className="info-line">
                <div>
                  <strong>Instagram</strong>
                  <span>
                    <a href="https://instagram.com/style.in.pk" target="_blank" rel="noopener noreferrer">
                      @style.in.pk
                    </a>
                  </span>
                </div>
              </div>
              <div className="info-line">
                <div>
                  <strong>Studio</strong>
                  <span>4th Floor, Fortress Square, Lahore</span>
                </div>
              </div>
              <div className="map-box">Studio location — Lahore, Pakistan</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — AccordionSection reuse ho raha hai, jo humne product page
          ke liye banaya tha. Yeh alag file/component ban chuka hai isliye
          yahan dobara implement karne ki zaroorat nahi padi. */}
      <section className="section-tight" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="section-head">
            <h2>Common questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <AccordionSection key={faq.q} title={faq.q} defaultOpen={i === 0} variant="question">
              {faq.a}
            </AccordionSection>
          ))}
        </div>
      </section>
    </>
  );
}

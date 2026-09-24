"use client";
// "use client" zaroori hai — Framer Motion ka "whileInView" (scroll karte
// waqt animate hona) sirf browser mein kaam karta hai.

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

// Yeh "recipe" har section ke liye reuse hogi — scroll karke jab section
// screen mein aaye tab fade-up ho. "once: true" ka matlab hai animation
// sirf PEHLI baar chalegi, dobara scroll up-down karne par baar baar nahi.
const revealProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const VALUES = [
  {
    num: "01",
    title: "Materials you can trust",
    text: "Full-grain and vegan leathers sourced directly from Lahore workshops, tested for cracking, colour transfer and stitch strength before they ever reach a bag.",
  },
  {
    num: "02",
    title: "Priced to actually buy",
    text: "No middlemen markup — we sell direct, so a well-made bag doesn't have to mean a month of saving up for it.",
  },
  {
    num: "03",
    title: "7 days to change your mind",
    text: "Order, try it with your actual outfits, and send it back within a week if it's not right. No forms, just a WhatsApp message.",
  },
];

const TIMELINE = [
  {
    year: "2022",
    title: "Founded in a spare room, Lahore",
    text: "First 50 totes hand-cut and stitched with a workshop two streets away. Sold out in four days.",
  },
  {
    year: "2023",
    title: "Shoes joined the shop",
    text: "Starting with three heel styles, built with the same durability standard as the bags.",
  },
  {
    year: "2024",
    title: "Nationwide cash on delivery",
    text: "Expanded delivery beyond Lahore and Karachi to every major city, with COD to make ordering online feel less like a leap of faith.",
  },
  {
    year: "2026",
    title: "60+ styles, one small team",
    text: "Still run by the same core team that packed those first 50 orders — just with a proper warehouse instead of a spare room.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="wrap">
          <div className="crumb">Home / About</div>
          <h1>Started with one tote and a spare room</h1>
          <p>
            Style-IN began in Lahore in 2022 because good bags kept costing
            too much or falling apart too fast. We set out to fix one of
            those problems — and stubbornly refused to compromise on the
            other.
          </p>
        </div>
      </div>

      {/* Story split section */}
      <motion.section className="section" {...revealProps}>
        <div className="wrap split">
          <div className="split-art">
            <svg viewBox="0 0 200 200" fill="none" stroke="#7c5636" strokeWidth="2">
              <path d="M60 80 L60 60 Q60 30 100 30 Q140 30 140 60 L140 80" />
              <rect x="40" y="80" width="120" height="90" rx="10" />
              <line x1="40" y1="115" x2="160" y2="115" />
            </svg>
          </div>
          <div className="split-copy">
            <div className="kicker">How it started</div>
            <h2>A problem worth solving</h2>
            <p>
              Our founder spent three years buying — and returning — bags
              that looked sturdy online and fell apart within a season. So
              she started sourcing materials directly from tanneries and
              workshops around Lahore, testing samples herself before
              anything went up for sale.
            </p>
            <p>
              The first batch was 50 totes, sewn by a small family-run
              workshop in Township. They sold out in four days, entirely
              through word of mouth.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Values grid */}
      <motion.section
        className="section-tight"
        style={{ background: "var(--cream)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
        {...revealProps}
      >
        <div className="wrap">
          <div className="section-head">
            <h2>What we won&apos;t compromise on</h2>
          </div>
          <div className="value-grid">
            {VALUES.map((value) => (
              <div className="value-card" key={value.num}>
                <div className="num">{value.num}</div>
                <h4>{value.title}</h4>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section className="section" {...revealProps}>
        <div className="wrap">
          <div className="section-head">
            <h2>Where we&apos;ve been</h2>
            <p>The short version of four years, minus the late nights.</p>
          </div>
          <div className="timeline">
            {TIMELINE.map((item) => (
              <div className="timeline-item" key={item.year}>
                <div className="yr">{item.year}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Closing CTA */}
      <div className="promo">
        <div className="wrap" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
          <h3>Ready to see the current lineup?</h3>
          <p style={{ marginBottom: 20 }}>60+ bags and shoes, all in stock, all ready to ship.</p>
          <Button href="/shop" variant="outline-dark">
            Shop Now
          </Button>
        </div>
      </div>
    </>
  );
}

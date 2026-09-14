"use client";
// "use client" chahiye kyunke Framer Motion animations browser mein chalti hain.

import { motion } from "framer-motion";
import Button from "./ui/Button";

// Animation "recipe" ko ek variable mein rakha hai taake heading aur paragraph
// dono isi ek settings ko reuse karein — copy-paste nahi karna para.
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {/* Har child apne parent se thora der se animate hoga (staggerChildren)
              taake sab cheezein ek sath "pop" na karein, ek ke baad ek aayein */}
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div
              className="hero-eyebrow"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
            >
              Autumn Edit — New In
            </motion.div>

            <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }}>
              Your day, well carried.
            </motion.h1>

            <motion.p
              className="lede"
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              Bags and shoes designed for Karachi's mornings, Lahore's
              evenings, and everything that happens in between. No fuss, no
              fragile stitching — just pieces you'll actually reach for.
            </motion.p>

            <motion.div
              className="hero-ctas"
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <Button href="/shop">Shop New Arrivals</Button>
              <Button href="/shop?category=shoe" variant="outline">
                Explore Shoes
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero art thora alag se, thori der baad aur halka scale-in ke sath
            animate hota hai — is se hero ek "layer by layer" feel deta hai */}
        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <svg
            viewBox="0 0 400 360"
            fill="none"
            stroke="#7c5636"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M120 150 L120 120 Q120 80 170 80 Q220 80 220 120 L220 150" />
            <rect x="90" y="150" width="160" height="150" rx="14" />
            <line x1="90" y1="192" x2="250" y2="192" />
            <circle cx="170" cy="225" r="9" />
            <path d="M232 262 Q232 242 252 236 L292 222 Q304 218 304 232 L304 248 Q324 248 328 266 Q332 282 310 286 L240 286 Q228 286 228 274 Q228 264 232 262 Z" />
            <path d="M252 236 L252 252" />
          </svg>

          <div className="hero-tagcard">
            <span className="dot"></span>
            <div>
              <strong>12,000+</strong> orders delivered across Pakistan
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

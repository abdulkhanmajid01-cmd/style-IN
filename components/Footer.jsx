"use client";
// "use client" zaroori hai kyunke newsletter form ke liye useState
// (subscribed / not subscribed) chahiye.

import { useState } from "react";
import Link from "next/link";
import Button from "./ui/Button";

// Footer link columns ko data ki tarah rakha hai — is se agar kabhi
// link add/remove karna ho to JSX chedne ki zaroorat nahi, bas yeh array badlega.
const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop?category=bag", label: "All Bags" },
      { href: "/shop?category=shoe", label: "All Shoes" },
      { href: "/shop", label: "New Arrivals" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Track Order" },
      { href: "/contact", label: "Returns & Exchanges" },
      { href: "/contact", label: "FAQs" },
    ],
  },
  {
    title: "Style-IN",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Phase 1 mein yeh sirf UI confirm karta hai — Phase 2 mein isse
  // real API route (/api/newsletter) ko call karna shuru karenge.
  function handleSubscribe(e) {
    e.preventDefault(); // form ka default page-reload rok rahe hain
    if (!email) return; // khali email par kuch na ho
    setSubscribed(true);
    setEmail("");
  }

  return (
    <>
      <div className="newsletter">
        <div className="wrap">
          <div>
            <h3>Get first look at new drops</h3>
            <p>One email a week, mostly new arrivals and the occasional sale.</p>
            {subscribed && <p className="nl-note show">Thanks — you're on the list.</p>}
          </div>
          <form className="nl-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="light">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <footer className="site">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              STYLE<em>-IN</em>
            </Link>
            <p>
              Bags and shoes designed for everyday Pakistan — considered pieces
              you'll actually reach for, at prices that make sense.
            </p>
            <div className="social-row">
              {/* NOTE: placeholder links hain — apna asal Instagram handle aur
                  WhatsApp business number daal kar inhe update kar lena */}
              <a
                href="https://instagram.com/style.in.pk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" />
                </svg>
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
                  <path d="M8.5 9.5c0 3.5 2.5 6 6 6 .5 0 1-.4 1-1v-1l-2-1-1 1a5.5 5.5 0 0 1-3-3l1-1-1-2h-1c-.6 0-1 .5-1 1Z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 9h3V5h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Har column ko array se generate kar rahe hain — dobara likhna nahi para */}
          {FOOTER_COLUMNS.map((col) => (
            <div className="footer-col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="wrap footer-bottom">
          <span>© 2026 Style-IN. All rights reserved.</span>
          <span>Made for Pakistan</span>
        </div>
      </footer>
    </>
  );
}

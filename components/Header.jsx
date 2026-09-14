"use client";
// "use client" zaroori hai — usePathname() (current URL padhne ke liye) aur
// useState (mobile menu open/close) dono sirf client par chalte hain.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CartIcon from "./CartIcon";

// Nav links ek array mein rakhe hain taake desktop aur mobile dono menu
// isi ek jagah se render hon — do baar links type nahi karne parte.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname(); // current page ka URL, jaise "/shop"
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <div className="announce">
        Free delivery on orders above Rs. 4,000{" "}
        <span>|</span> Cash on delivery available nationwide
      </div>

      <header className="site">
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            STYLE<em>-IN</em>
          </Link>

          {/* Desktop nav — mobile par CSS se hide ho jata hai (globals.css) */}
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // Active link ko highlight karne ke liye current pathname se compare
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.6" y2="16.6" />
              </svg>
            </button>

            <CartIcon />

            {/* Hamburger — sirf mobile par CSS se dikhta hai */}
            <button
              className="hamburger"
              aria-label="Menu"
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((prev) => !prev)}
            >
              <span className="hamburger-lines">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* AnimatePresence taake menu band hote waqt bhi smooth animation ho
            (sirf hide nahi ho jaye, DOM se nikalne se pehle exit animation chale) */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              className="mobile-panel open"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)} // link click par menu apne aap band ho jaye
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

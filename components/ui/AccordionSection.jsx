"use client";
// "use client" zaroori hai — open/close state (useState) aur click handler
// dono client-side hain.

import { useState } from "react";

// title: section ka heading (jaise "Size Guide" ya poora FAQ sawal)
// children: andar ka content (text, list, kuch bhi ho sakta hai)
// defaultOpen: agar true ho to page load hote hi khula rahega
// variant: "label" (default, uppercase — Size Guide jaisi chhoti labels ke
//   liye) | "question" (normal case — FAQ jaise poore sentences ke liye,
//   kyunke poora sawal uppercase karna padhna mushkil bana deta hai)
export default function AccordionSection({ title, children, defaultOpen = false, variant = "label" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`accordion-item ${isOpen ? "open" : ""}`}>
      <button
        className={`accordion-trigger ${variant === "question" ? "accordion-trigger-question" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen} // screen readers ko batata hai section khula hai ya band
      >
        <span>{title}</span>
        <span className="accordion-icon">{isOpen ? "−" : "+"}</span>
      </button>

      {/* Content sirf tab render hota hai jab section khula ho — is se
          band sections ka content DOM mein bhi nahi rehta, thora lighter rehta hai */}
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
}

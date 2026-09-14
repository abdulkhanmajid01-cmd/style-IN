// Badge.jsx — koi "use client" nahi chahiye kyunke isme koi
// interactivity (onClick, useState) nahi hai — sirf static label dikhata hai.
// Yeh Server Component reh sakta hai, jo thoda better performance deta hai.

// variant: "new" (black bg) | "sale" (red bg) | "sold-out" (grey, muted)
// children: badge ke andar ka text, jaise "New" ya "Sale"
export default function Badge({ variant = "new", children }) {
  // variant ke hisaab se sahi CSS class select kar rahe hain.
  // "badge" base class hai, "new"/"sale"/"sold-out" color modifier hai —
  // style globals.css mein already define hogi.
  const variantClass =
    variant === "sale" ? "sale" : variant === "sold-out" ? "sold-out" : "new";

  return <span className={`badge ${variantClass}`}>{children}</span>;
}

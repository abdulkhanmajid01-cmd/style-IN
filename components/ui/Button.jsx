"use client";
// "use client" zaroori hai kyunke is component ko onClick handlers milenge
// jo sirf client-side par kaam karte hain (server components mein functions
// pass nahi ho sakte).

import Link from "next/link";

// variant: "primary" (solid dark) | "outline" (border only) | "outline-dark" (light border on dark bg, jaise promo banner par) | "light" (white bg, dark text — dark bg par solid button ke liye, jaise newsletter)
// size: "md" (default) | "sm" (chhota — product cards mein)
// href: agar diya jaye to button ki jagah Next.js <Link> render hoga (navigation ke liye)
// fullWidth: true ho to button apne container ki poori width le lega
export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  fullWidth = false,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) {
  // Sab variants/sizes ke liye CSS classes ek string mein jorh rahe hain.
  // Yeh classes globals.css mein define hongi (purani style.css se hi aayengi).
  const classes = [
    "btn",
    variant === "primary" && "btn-primary",
    variant === "outline" && "btn-outline",
    variant === "outline-dark" && "btn-outline on-dark",
    variant === "light" && "btn-light", // white bg, dark text — newsletter jaisi dark sections ke liye
    size === "sm" && "btn-sm",
    fullWidth && "btn-block",
    className,
  ]
    .filter(Boolean) // false/undefined/"" hata dega, sirf real class names bachenge
    .join(" ");

  // Agar href diya gaya hai, to yeh ek link hai (jaise "Shop Now" → /shop)
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  // Warna yeh ek normal button hai (jaise "Add to Bag", form submit)
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

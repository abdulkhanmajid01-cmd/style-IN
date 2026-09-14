// layout.jsx — yeh Server Component hai (koi "use client" nahi), kyunke
// isme koi state/interactivity nahi, sirf structure aur fonts setup hai.
// Client-side cheezein (CartProvider, Header, CartDrawer) khud apne
// andar "use client" rakhti hain — root layout unhe sirf render karta hai.

import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

// next/font/google use karne ka fayda: fonts build-time par download ho
// kar khud hosting ke sath serve hote hain (Google Fonts ko runtime par
// call nahi karna parta) — is se site fast bhi hoti hai aur privacy bhi
// behtar (browser Google ko directly request nahi bhejta).
// variable: yeh CSS custom property ka naam hai jisse hum globals.css mein
// is font ko reference karenge.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-family",
  weight: ["500", "600", "700", "800"],
  display: "swap", // font load hone tak fallback font dikhega, "invisible text" nahi
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-family",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Next.js ka built-in SEO metadata system — is se manually <title>/<meta>
// tags likhne ki zaroorat nahi, aur yeh sab pages ka default bhi ban jata hai
export const metadata = {
  title: "Style-IN — Bags & Shoes for Everyday Pakistan",
  description:
    "Style-IN designs bags and shoes for everyday Pakistan — considered pieces at honest prices, with nationwide cash on delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body>
        {/* CartProvider sab se bahar hai — is ke andar har cheez
            (Header ka cart icon, ProductCard ka "Add to Bag", Footer)
            cart ke data tak pahunch sakti hai */}
        <CartProvider>
          <Header />
          {children /* yahan har page ka apna content aayega (Home, Shop, etc.) */}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

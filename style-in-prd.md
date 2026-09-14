# Style-IN — Product Requirements Document (PRD)

## 1. Overview

**Product:** Style-IN — women's bags & shoes e-commerce website (Pakistan)
**Reference:** outfitters.com.pk (visual style, layout, shopping experience)
**Goal:** Ek full-stack, mobile-friendly online store jahan customers bags/shoes browse
karke, cart mein daal kar, Cash on Delivery se order place kar sakein — aur business
owner (admin) khud products aur orders manage kar sake, bina kisi developer ki madad ke.

## 2. Target Users

| User | Needs |
|---|---|
| **Customer** | Products browse karna, cart mein add karna, mobile se aasani se order karna, COD se pay karna |
| **Admin (business owner)** | Products add/edit/delete karna, incoming orders dekhna, order status update karna (Pending → Delivered), sab secure ho |

## 3. Core Features (Functional Requirements)

### Customer-facing
- [ ] Home page — hero, category highlights, featured products, promo, newsletter
- [ ] Shop page — sab products, category filter (Bags / Shoes)
- [ ] Product detail page — images/video gallery, price, description, quantity, "Add to Cart"
- [ ] Cart — slide-out drawer, quantity update, remove item, persists on refresh
- [ ] Checkout — naam, phone, address, city → order place (COD only, koi online payment nahi)
- [ ] Order confirmation page
- [ ] About & Contact pages (contact form → admin ko dikhega)
- [ ] Fully mobile-responsive (Outfitters jaisa)
- [ ] Animations — page/section reveal, cart drawer slide, hover states (Framer Motion)

### Admin-facing
- [ ] Secure login (JWT + rate limiting on failed attempts)
- [ ] Dashboard — orders overview
- [ ] Products — add / edit / delete (name, price, category, colors, sizes, media, badge)
- [ ] Product media — admin upload ek hi field se images AUR short videos dono accept karega (Supabase Storage dono ko same tareeqe se handle karta hai). Product schema: `media: [{ type: "image"|"video", url }]`, single `imageUrl` field nahi.
- [ ] Orders — list all orders, view details, update status
- [ ] Contact messages — customer ke bheje hue messages dekhna

## 4. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **Security** | Koi secret/API key frontend ya GitHub pe expose na ho. Admin routes JWT-protected + rate-limited. Passwords hashed. `.env.local` git-ignored. |
| **Performance** | Fast load, optimized images, minimal JS on customer pages |
| **Responsiveness** | Mobile-first — sab pages phone, tablet, desktop pe theek dikhein |
| **Hosting** | Free-tier friendly (Vercel + Neon Postgres) for testing, easily upgradable |
| **Payment** | Sirf Cash on Delivery — koi payment gateway integration nahi (scope ke bahar) |
| **Code quality** | Reusable UI components (Button, Badge, PriceTag), no dead code, clean folder structure |

## 5. Out of Scope (abhi ke liye)

- Online payment (JazzCash/Easypaisa/card) — sirf COD
- Customer login/accounts — guest checkout only
- AI search/recommendations — remove kar diya gaya (paid API avoid karne ke liye)
- Email notifications — future addition, pehle explicit permission lena hoga (risky/external-facing step)
- Multi-admin roles — sirf ek admin

## 6. MVP Definition — "Done" kab hoga?

MVP mukammal tab consider hoga jab yeh sab ho:

1. Customer poora flow complete kar sake: Home → Shop → Product → Cart → Checkout → Order Confirmation
2. Order database mein save ho aur admin panel mein dikhe
3. Admin login secure ho (JWT + rate limit) aur products add/edit/delete kar sake
4. Website mobile par Outfitters jaisi hi smooth chale
5. Koi secret ya API key frontend/GitHub par leak na ho (manually verify karenge push se pehle)

## 7. Build Phases (Execution Plan)

| Phase | Deliverable | Data Source |
|---|---|---|
| **Phase 1 — Frontend** | Sab pages + components + cart UI | Hardcoded array (`lib/data/products.js`) |
| **Phase 2 — Backend** | API routes, admin auth (JWT + rate limit), admin UI | In-memory/temporary data |
| **Phase 3 — Database** | Prisma + Neon Postgres, seed data, real persistence | Real DB — replaces Phase 1 & 2 placeholders |

Har phase ke baad: local test → security check (koi secret leak nahi) → phir GitHub push.

## 8. Tech Stack

- **Framework:** Next.js 14+ (App Router), JSX files for UI
- **Styling:** Custom CSS (design tokens, existing Style-IN visual system)
- **Animation:** Framer Motion
- **State (cart):** React Context + localStorage
- **Database:** PostgreSQL (Neon, free tier)
- **ORM:** Prisma
- **Auth:** JWT (`jose` library — Edge-runtime compatible) + rate limiting via DB table
- **Deployment:** Vercel (free tier for testing)

## 9. Final Project Structure

```
style-in/
├── middleware.js                          # /admin/* route protection (JWT check)
│
├── app/
│   ├── layout.jsx                         # Root layout: fonts, CartProvider, Header/Footer
│   ├── globals.css                        # Design system
│   ├── page.jsx                           # Home
│   ├── shop/page.jsx                      # Shop + filters
│   ├── product/[slug]/page.jsx            # Product detail
│   ├── about/page.jsx
│   ├── contact/page.jsx
│   ├── checkout/page.jsx
│   ├── order-confirmation/[id]/page.jsx
│   │
│   ├── admin/
│   │   ├── login/page.jsx
│   │   ├── page.jsx                       # Dashboard
│   │   ├── products/page.jsx
│   │   └── orders/page.jsx
│   │
│   └── api/
│       ├── products/route.js              # GET (public)
│       ├── orders/route.js                # POST (public) — COD order create
│       ├── contact/route.js               # POST (public)
│       └── admin/
│           ├── login/route.js             # POST — verify + JWT issue
│           ├── logout/route.js            # POST — clear session
│           ├── products/route.js          # GET/POST/PUT/DELETE (protected)
│           └── orders/route.js            # GET/PATCH (protected)
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx                     # Reusable — variant, size
│   │   ├── Badge.jsx                      # "New" / "Sale" label
│   │   └── PriceTag.jsx                   # Price + strikethrough + discount
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── CartDrawer.jsx
│   ├── CartIcon.jsx
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── Hero.jsx
│   ├── Newsletter.jsx
│   ├── CheckoutForm.jsx
│   └── admin/
│       ├── AdminSidebar.jsx
│       ├── ProductForm.jsx
│       └── OrdersTable.jsx
│
├── context/
│   └── CartContext.jsx                    # Cart state, localStorage sync
│
├── lib/
│   ├── data/
│   │   └── products.js                    # Phase 1 temp data (removed in Phase 3)
│   ├── prisma.js                          # DB connection (server-only)
│   ├── auth.js                            # JWT sign/verify, password hash check
│   └── rateLimit.js                       # Login attempt tracking
│
├── prisma/
│   ├── schema.prisma                      # Product, Order, OrderItem, ContactMessage, LoginAttempt
│   └── seed.js
│
├── public/
├── .env.local                             # Real secrets — git-ignored
├── .env.example                           # Safe placeholder names — committed
├── .gitignore
└── package.json
```

## 10. Acceptance Checklist (before GitHub push, every phase)

- [ ] `.env.local` `.gitignore` mein hai — `git status` se confirm
- [ ] Koi API key/secret directly code mein hardcoded nahi
- [ ] `.env.example` mein sirf variable names hain, real values nahi
- [ ] Admin routes bina valid session ke accessible nahi
- [ ] Us phase ka core flow manually test ho chuka hai

# Style-IN

Women's bags & shoes e-commerce website — Next.js (App Router).

## Status: Phase 1 (Frontend) complete

- ✅ All pages (Home, Shop, Product, About, Contact, Checkout, Order Confirmation, 404)
- ✅ Cart system (localStorage)
- ✅ Dynamic categories, color/size variants, per-variant stock
- ⏳ Phase 2 (Backend/Admin) and Phase 3 (Database) not started yet — see `style-in-prd.md`

## Setup (VS Code)

1. Open this folder in VS Code
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Before pushing to GitHub

- Confirm `.env.local` (if it exists later) is **not** tracked — run `git status` and make sure it doesn't appear.
- `.env.example` is safe to commit (placeholder names only, no real secrets).

## Project Structure

```
app/              → Pages (Next.js App Router)
components/       → Reusable UI components
  ui/             → Small reusable atoms (Button, Badge, PriceTag, AccordionSection)
context/          → CartContext (cart state, localStorage)
lib/data/         → Temporary hardcoded data (products, categories) — replaced by database in Phase 3
```

## Data Model Notes (for Phase 3)

- Products use **per-variant stock**: `variants: [{ color, size, stock }]` — not a single flat stock number.
- Categories are **data-driven** (`lib/data/categories.js`) — Home page and Shop filters loop over this list, so admin-added categories appear automatically without code changes.

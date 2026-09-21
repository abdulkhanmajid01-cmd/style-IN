// app/api/categories/route.js
// PUBLIC endpoint (middleware protect nahi karta — /api/admin/ ke bahar hai).
// Storefront (Shop filter pills) live categories yahan se leta hai, jo admin
// ke changes reflect karti hain

import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/data/store";

// Public categories live store se aati hain — static prerender na ho, warna
// admin ke runtime changes kabhi nazar nahi aate
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAllCategories());
}
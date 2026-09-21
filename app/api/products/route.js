import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/store";

// Live store se data — static prerender na ho, warna admin ke edits
// shop mein kabhi reflect nahi hote
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAllProducts());
}
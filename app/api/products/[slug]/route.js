import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/store";

// Live store se data padhta hai — static prerender na ho, warna admin ke
// edits is par kabhi nazar nahi aate
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}
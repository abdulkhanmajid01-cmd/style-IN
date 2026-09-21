import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/store";

export async function GET(request, { params }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}
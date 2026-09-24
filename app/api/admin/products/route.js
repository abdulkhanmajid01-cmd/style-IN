import { NextResponse } from "next/server";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/data/store";



export async function GET() {
  return NextResponse.json(await getAllProducts());
}

export async function POST(request) {
  const body = await request.json();

  if (!body.name || !body.price || !body.category) {
    return NextResponse.json(
      { error: "name, price, and category are required." },
      { status: 400 }
    );
  }

  // Explicit normalization — khali/undefined fields null ho jayein aur badge
  // ("sale"/"new") string ke roop mein wahi rahe jaisa form bhejta hai
  const newProduct = await addProduct({
    ...body,
    price: Number(body.price),
    salePrice: body.salePrice ? Number(body.salePrice) : null,
    badge: body.badge && String(body.badge).trim() ? String(body.badge).trim() : null,
  });
  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  // Same normalization as POST — taake badge kabhi galti se null na ho
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.salePrice !== undefined) {
    updates.salePrice = updates.salePrice ? Number(updates.salePrice) : null;
  }
  if (updates.badge !== undefined) {
    updates.badge = updates.badge && String(updates.badge).trim() ? String(updates.badge).trim() : null;
  }

  const updated = await updateProduct(id, updates);
  if (!updated) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  const deleted = await deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
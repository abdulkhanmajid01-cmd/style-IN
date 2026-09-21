import { NextResponse } from "next/server";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/data/store";



export async function GET() {
  return NextResponse.json(getAllProducts());
}

export async function POST(request) {
  const body = await request.json();

  if (!body.name || !body.price || !body.category) {
    return NextResponse.json(
      { error: "name, price, and category are required." },
      { status: 400 }
    );
  }

  const newProduct = addProduct(body);
  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  const updated = updateProduct(id, updates);
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

  const deleted = deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
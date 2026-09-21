// app/api/admin/categories/route.js
// PROTECTED endpoint — /api/admin/ ke andar hone ki wajah se middleware
// JWT cookie se khud protect karta hai, extra auth code ki zaroorat nahi
//
// POST: naya category banata hai. Slug client se nahi maangta — naami se
// khud auto-generate karta hai (slugify) taake client bharosa na karna pade
// PUT: category update (slug identity rehta hai, change nahi hota)
// DELETE: category delete — pehle check ke usme products na hon

import { NextResponse } from "next/server";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
} from "@/lib/data/store";
import { slugify } from "@/lib/slugify";

export async function GET() {
  return NextResponse.json(getAllCategories());
}

export async function POST(request) {
  const body = await request.json();

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const newCategory = addCategory({
    name,
    slug: slugify(name),
    bannerTitle: body.bannerTitle || name.toUpperCase(),
    bannerSubtitle: body.bannerSubtitle || "",
    bannerImage: body.bannerImage || null, // upload se aayega — optional
    visual: body.visual || "bag", // "bag" | "shoe" — fallback icon
  });

  return NextResponse.json(newCategory, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const { slug, ...updates } = body;

  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  // name update par bhi slug wahi rehta hai — products usi se link hain
  if (updates.name !== undefined) updates.name = String(updates.name).trim();

  const updated = updateCategory(slug, updates);
  if (!updated) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  // Agar kisi product ki category yeh slug hai to delete block karo —
  // warna products bina category ke rah jate aur seed data toot jata
  const hasProducts = getAllProducts().some((p) => p.category === slug);
  if (hasProducts) {
    return NextResponse.json(
      { error: "Is category mein products hain — pehle unhe dusri category mein move ya delete karein" },
      { status: 400 }
    );
  }

  const deleted = deleteCategory(slug);
  if (!deleted) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
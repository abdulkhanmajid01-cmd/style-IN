import { NextResponse } from "next/server";
import { getProductById, addOrder } from "@/lib/data/store";

export async function POST(request) {
  const body = await request.json();
  const { fullName, email, phone, whatsapp, address, city, items } = body;

  if (!fullName || !phone || !address || !city || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
  }

  // Server-side integrity check: har item ek REAL product hona chahiye (jo
  // cart save hone ke baad delete bhi ho sakta hai) aur quantity valid.
  // Prices/total client se nahi aati — addOrder khud database se nikalta hai.
  for (const item of items) {
    if (!item?.id || typeof item.id !== "string") {
      return NextResponse.json({ error: "Invalid item in order." }, { status: 400 });
    }
    const product = await getProductById(item.id);
    if (!product) {
      return NextResponse.json(
        { error: "One or more items are no longer available. Please refresh your cart." },
        { status: 400 }
      );
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return NextResponse.json({ error: "Invalid item quantity." }, { status: 400 });
    }
  }

  // totalPrice is NOT passed — addOrder server par calculate karta hai
  const order = await addOrder({
    fullName,
    email,
    phone,
    whatsapp,
    address,
    city,
    items,
  });

  return NextResponse.json(order, { status: 201 });
}
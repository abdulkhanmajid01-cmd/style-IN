import { NextResponse } from "next/server";
import { addOrder } from "@/lib/data/store";

export async function POST(request) {
  const body = await request.json();
  const { fullName, email, phone, whatsapp, address, city, items, totalPrice } = body;

  if (!fullName || !phone || !address || !city || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
  }

  const order = addOrder({
    fullName,
    email,
    phone,
    whatsapp,
    address,
    city,
    items,
    totalPrice,
  });

  return NextResponse.json(order, { status: 201 });
}
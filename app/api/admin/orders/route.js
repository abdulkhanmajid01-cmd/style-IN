import { NextResponse } from "next/server";
import { getAllOrders, updateOrderStatus } from "@/lib/data/store";

export async function GET() {
  const orders = [...(await getAllOrders())].reverse();
  return NextResponse.json(orders);
}

export async function PATCH(request) {
  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}
import { NextResponse } from "next/server";
import { addContactMessage } from "@/lib/data/store";

export async function POST(request) {
  const { name, email, order, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const saved = await addContactMessage({ name, email, order, message });
  return NextResponse.json(saved, { status: 201 });
}
import { NextResponse } from "next/server";
import { getAllContactMessages } from "@/lib/data/store";

// Yeh route middleware.js se already protected hai (/api/admin/:path*)

export async function GET() {
  return NextResponse.json(getAllContactMessages());
}
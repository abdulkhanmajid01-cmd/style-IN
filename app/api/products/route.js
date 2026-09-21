import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/store";

export async function GET() {
  return NextResponse.json(getAllProducts());
}
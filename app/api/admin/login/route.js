import { NextResponse } from "next/server";
import { verifyPassword, signSessionToken } from "@/lib/auth";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/rateLimit";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const isValid = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);

  if (!isValid) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearAttempts(ip);
  const token = await signSessionToken({ role: "admin" });

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2,
    path: "/",
  });

  return response;
}
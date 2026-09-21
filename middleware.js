import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Login/logout ko khud check karne ki zaroorat nahi — warna login karne
  // ke liye bhi pehle se login hona padega (infinite loop)
  if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const isApiRoute = pathname.startsWith("/api/");

  if (!token) {
    // API routes ko HTML login page par redirect nahi karte — JSON error
    // dete hain, warna fetch() call JSON parse karte waqt crash ho jayega
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}
import { NextResponse } from "next/server";
import { verifyPassword, BCRYPT_HASH_LENGTH } from "@/lib/auth";
import { signSessionToken } from "@/lib/jwt";
import { isRateLimited, recordFailedAttempt, clearAttempts, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
  // ---- Config guard (sabse pehle) ----
  // ADMIN_PASSWORD_HASH .env.local se aata hai. Uski value mein `$` hota
  // hai (jaise `$2a$10$...`), aur Next.js ka env loader `dotenv-expand`
  // chala kar un `$` ko variable interpolation samajh leta hai — jisse
  // hash kat jata hai (60 chars -> 33 chars) aur har login "Incorrect
  // password." kehte hue 401 fail hota hai, jabki asal masla config ka hai.
  //
  // Isliye: hash 60 chars ka nahi hai to SAHI error (500) do, taake asli
  // wajah turhat pata chale — galat password ka shak nahi karwaye.
  // .env.local mein hash LIKHTE waqt har `$` ke aage `\` lagana zaroori
  // hai, jaise: ADMIN_PASSWORD_HASH=\$2a\$10\$...
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (typeof passwordHash !== "string" || passwordHash.length !== BCRYPT_HASH_LENGTH) {
    // Hash ki value KABHI log nahi karte — sirf wajah log karte hain.
    console.error(
      `[admin/login] ADMIN_PASSWORD_HASH missing ya malformed (length=${
        typeof passwordHash === "string" ? passwordHash.length : "undefined"
      }, expected ${BCRYPT_HASH_LENGTH}). .env.local mein har "$" ke aage "\\" escape karo.`
    );
    return NextResponse.json(
      { error: "Server configuration error: Malformed password hash" },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);

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

  const isValid = await verifyPassword(password, passwordHash);

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
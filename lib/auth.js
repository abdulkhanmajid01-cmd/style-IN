// lib/auth.js — sirf server-side use hoti hai (API routes, middleware).
// Kabhi bhi client component mein import nahi honi chahiye — isme password
// hash aur JWT secret jaisi sensitive cheezein handle hoti hain.

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// JWT sign/verify ke liye "jose" library use ki hai, "jsonwebtoken" nahi —
// wajah: middleware.js Next.js ke EDGE runtime par chalta hai, aur
// "jsonwebtoken" Edge par kaam nahi karta (Node-specific APIs use karta
// hai). "jose" dono jagah (Node + Edge) chalti hai.

const JWT_EXPIRY = "2h"; // admin session 2 ghante mein expire ho jayega

// SESSION_SECRET .env.local se aata hai — kabhi bhi code mein hardcode
// nahi karni. Agar yeh set nahi hai to turant error throw karte hain,
// taake galti se bina secret ke app chal hi na sake.
function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set in environment variables.");
  }
  return new TextEncoder().encode(secret);
}

// ---- Password ----

export async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

export async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

// ---- JWT (session token) ----

export async function signSessionToken(payload) {
  const secretKey = getSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secretKey);
}

export async function verifySessionToken(token) {
  const secretKey = getSecretKey();
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}
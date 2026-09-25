// lib/auth.js — sirf PASSWORD (bcrypt) logic. Sirf Node.js runtime wale
// API routes ise import kar sakte hain.
//
// WARNING: is file mein `bcryptjs` import hai, jo Edge runtime par nahi
// chalta. Isliye middleware.js (Edge) ko yeh file NAHI import karni
// chahiye — token verification ke liye woh "./jwt" use karta hai.
//
// Kabhi bhi client component mein import nahi honi chahiye — isme password
// hash jaisi sensitive cheezein handle hoti hain.

import bcrypt from "bcryptjs";

// Token logic ab lib/jwt.js mein hai (Edge-safe). Yahan se dobara export
// kar rahe hain taake purane imports (`@/lib/auth`) toote nahi — naye code
// ko seedha `@/lib/jwt` se import karna chahiye.
export { signSessionToken, verifySessionToken } from "./jwt";

export const BCRYPT_HASH_LENGTH = 60; // bcrypt hash hamesha exactly 60 chars ka hota hai

// ---- Password ----

export async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

export async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}
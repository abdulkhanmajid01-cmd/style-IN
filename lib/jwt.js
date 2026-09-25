// lib/jwt.js — sirf JWT (session token) logic. Koi bcrypt, koi Node-only
// import NAHI hai, isliye yeh module middleware.js (Edge runtime) par bhi
// safely chalta hai.
//
// KYUN ALAG RAKHA: pehle yeh sab lib/auth.js ke andar tha, aur wahan
// `import bcrypt from "bcryptjs"` bhi tha. Edge runtime par bcryptjs nahi
// chalta, to middleware ka bundle mein bcrypt aa jata tha. Ab bcrypt sirf
// lib/auth.js mein hai (Node API routes) aur middleware sirf yeh file
// import karta hai — do bundles alag, koi conflict nahi.

import { SignJWT, jwtVerify } from "jose";

// JWT sign/verify ke liye "jose" library use ki hai, "jsonwebtoken" nahi —
// wajah: middleware.js Edge runtime par chalta hai, aur "jsonwebtoken"
// Edge par kaam nahi karta (Node-specific APIs use karta hai). "jose" dono
// jagah (Node + Edge) chalti hai.

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

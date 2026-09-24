// lib/prisma.js — Next.js ke liye Prisma Client singleton.
// Singleton pattern zaroori hai: dev mode mein hot-reload API routes ko baar
// baar re-evaluate karta hai. Agar har baar naya PrismaClient bane to
// multiple connections pool khul jate hain (connection exhaustion).
// Isliye instance globalThis par cache karte hain — jo poore process mein
// ek hi rehta hai aur dev reloads mein reuse hota hai.
//
// Prisma 7 ab seedha connection string nahi leta — driver adapter chahiye.
// @prisma/adapter-pg 'pg' pool ke upar Prisma client ko connect karta hai.
// DATABASE_URL transaction pooler (Supabase) hai — production/serverless
// ke liye yehi sahi hai (pgbouncer-friendly).

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
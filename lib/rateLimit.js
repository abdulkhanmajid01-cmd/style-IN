// lib/rateLimit.js — Login attempts ko IP address ke hisaab se track karta
// hai, taake koi bhi password guess karne ke liye baar-baar try na kar sake.
//
// PHASE 2 NOTE: Abhi database nahi hai, isliye attempts ek in-memory Map
// mein store ho rahe hain (server ki RAM mein). Iska matlab: server restart
// hone par sab attempts reset ho jayenge — Phase 2 ke liye theek hai, lekin
// Phase 3 mein isay database table (LoginAttempt) mein move karenge, taake
// yeh restart ke baad bhi yaad rahe aur multiple server instances mein
// consistent rahe.

const MAX_ATTEMPTS = 5; // itni baar galat try allowed hai
const WINDOW_MS = 5 * 60 * 1000; // 5 minute ki window ke andar
const BLOCK_MS = 15 * 60 * 1000; // block hone par 15 minute wait karna hoga

// Map: key = IP address, value = { attempts: number, firstAttemptAt: number, blockedUntil: number|null }
const attemptsStore = new Map();

// Login route yeh function call karega HAR request ke shuru mein, password
// check karne se PEHLE — agar IP already blocked hai to aage badhne ki
// zaroorat hi nahi.
export function isRateLimited(ip) {
  const record = attemptsStore.get(ip);
  if (!record) return false; // is IP ne pehle kabhi try nahi kiya

  // Agar block period abhi khatam nahi hua
  if (record.blockedUntil && Date.now() < record.blockedUntil) {
    return true;
  }

  // Block period khatam ho chuka — record reset kar dete hain (naya start)
  if (record.blockedUntil && Date.now() >= record.blockedUntil) {
    attemptsStore.delete(ip);
    return false;
  }

  return false;
}

// Galat password milne par login route yeh call karega — attempt count
// badhata hai, aur agar limit cross ho jaye to us IP ko block kar deta hai.
export function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = attemptsStore.get(ip);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    // Naya record shuru — ya purani window expire ho chuki, dobara se ginte hain
    attemptsStore.set(ip, { attempts: 1, firstAttemptAt: now, blockedUntil: null });
    return;
  }

  const newAttempts = record.attempts + 1;
  if (newAttempts >= MAX_ATTEMPTS) {
    // Limit cross — ab is IP ko block kar dete hain
    attemptsStore.set(ip, { ...record, attempts: newAttempts, blockedUntil: now + BLOCK_MS });
  } else {
    attemptsStore.set(ip, { ...record, attempts: newAttempts });
  }
}

// Successful login hone par attempts clear kar dete hain — taake agli
// baar genuine login pe purana count na atka rahe
export function clearAttempts(ip) {
  attemptsStore.delete(ip);
}
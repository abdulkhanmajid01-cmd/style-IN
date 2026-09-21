// scripts/generate-admin-hash.js
// Yeh script app ka hissa NAHI hai — sirf ek baar chalane ke liye hai,
// taake admin password ka hash generate ho sake. Chalane ke baad delete
// bhi kar sakte hain, ya rakh lein agar kabhi password change karna ho.

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// YAHAN apna chosen admin password likhein
const password = "StyleIN@2026";

async function run() {
  const hash = await bcrypt.hash(password, 10);
  const sessionSecret = crypto.randomBytes(32).toString("hex");

  console.log("\nADMIN_PASSWORD_HASH=" + hash);
  console.log("SESSION_SECRET=" + sessionSecret + "\n");
}

run();
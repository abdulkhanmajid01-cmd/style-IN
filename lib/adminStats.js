// lib/adminStats.js — sirf calculation functions hain, koi UI nahi.
// Orders array leke stats nikalte hain — is mahine ke numbers, aur
// pichle 6 mahinon ka revenue trend (chart ke liye).

function isSameMonth(dateStr, targetDate) {
  const d = new Date(dateStr);
  return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
}

// Dashboard ke top stat cards ke liye — sirf CURRENT month ka data
export function getMonthlyStats(orders) {
  const now = new Date();
  const thisMonthOrders = orders.filter((o) => isSameMonth(o.createdAt, now));

  const delivered = thisMonthOrders.filter((o) => o.status === "Delivered");
  const returned = thisMonthOrders.filter((o) => o.status === "Returned");

  // Revenue mein returned orders shamil nahi karte — woh sale count nahi hoti
  const revenue = thisMonthOrders
    .filter((o) => o.status !== "Returned")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return {
    totalOrders: thisMonthOrders.length,
    delivered: delivered.length,
    returned: returned.length,
    revenue,
  };
}

// Graph ke liye — pichle 6 mahinon (is mahine samet) ka revenue, chronological order mein
export function getRevenueByMonth(orders, monthsCount = 6) {
  const now = new Date();
  const result = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthOrders = orders.filter(
      (o) => isSameMonth(o.createdAt, targetDate) && o.status !== "Returned"
    );
    const revenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    result.push({
      month: targetDate.toLocaleDateString("en-US", { month: "short" }),
      revenue,
    });
  }

  return result;
}
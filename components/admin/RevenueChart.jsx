"use client";
// "use client" zaroori hai — recharts browser mein render hota hai (SVG + interactivity)

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// data: [{ month: "Jan", revenue: 12000 }, ...] — lib/adminStats.js ke
// getRevenueByMonth() se aata hai
export default function RevenueChart({ data }) {
  return (
    <div className="admin-chart-card">
      <h3>Revenue — Last 6 Months</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8377" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#8a8377" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
            contentStyle={{ borderRadius: 6, border: "1px solid #e4dfd3", fontSize: 13 }}
          />
          <Bar dataKey="revenue" fill="#7c5636" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
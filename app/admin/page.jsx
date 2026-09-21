"use client";
// "use client" zaroori hai — orders/products fetch karne ke liye useEffect
// chahiye (dashboard ab live data dikhata hai, sirf static count nahi)

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import RevenueChart from "@/components/admin/RevenueChart";
import { getMonthlyStats, getRevenueByMonth } from "@/lib/adminStats";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((res) => res.json()),
      fetch("/api/admin/orders").then((res) => res.json()),
    ]).then(([productsData, ordersData]) => {
      setProducts(productsData);
      setOrders(ordersData);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="admin-page">
        <p>Loading...</p>
      </div>
    );
  }

  const totalProducts = products.length;
  const soldOutCount = products.filter((p) =>
    p.variants.every((v) => v.stock === 0)
  ).length;

  const monthlyStats = getMonthlyStats(orders);
  const revenueChartData = getRevenueByMonth(orders);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-num">{totalProducts}</span>
          <span className="admin-stat-label">Total Products</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{soldOutCount}</span>
          <span className="admin-stat-label">Sold Out</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{monthlyStats.totalOrders}</span>
          <span className="admin-stat-label">Orders This Month</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{monthlyStats.delivered}</span>
          <span className="admin-stat-label">Delivered</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{monthlyStats.returned}</span>
          <span className="admin-stat-label">Returned</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">Rs. {monthlyStats.revenue.toLocaleString()}</span>
          <span className="admin-stat-label">Revenue This Month</span>
        </div>
      </div>

      <RevenueChart data={revenueChartData} />

      <div className="admin-nav-cards" style={{ marginTop: 32 }}>
        <Link href="/admin/products" className="admin-nav-card">
          <h3>Products</h3>
          <p>Add, edit, or remove products and stock.</p>
        </Link>
        <Link href="/admin/categories" className="admin-nav-card">
          <h3>Categories</h3>
          <p>Add categories and manage their banners.</p>
        </Link>
        <Link href="/admin/orders" className="admin-nav-card">
          <h3>Orders</h3>
          <p>View incoming orders and update status.</p>
        </Link>
        <Link href="/admin/messages" className="admin-nav-card">
          <h3>Messages</h3>
          <p>Contact form submissions from customers.</p>
        </Link>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setIsLoading(false);
      });
  }, []);

  function formatDate(iso) {
    return new Date(iso).toLocaleString("en-PK", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1>Messages</h1>
        </div>
        <LogoutButton />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : messages.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No messages yet.</p>
      ) : (
        <div className="admin-message-list">
          {messages.map((msg) => (
            <div key={msg.id} className="admin-message-card">
              <div className="admin-message-top">
                <strong>{msg.name}</strong>
                <span>{formatDate(msg.createdAt)}</span>
              </div>
              <div className="admin-message-email">{msg.email}</div>
              {msg.order && <div className="admin-message-order">Order: {msg.order}</div>}
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
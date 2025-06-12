import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <h2>🛒 Roblox Store</h2>
      <div style={{ display: "flex", gap: "15px" }}>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/login">Seller Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff"
};

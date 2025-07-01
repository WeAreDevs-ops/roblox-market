import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./HeaderNavbar.css";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Listing Panel", path: "/admin" },
  { name: "Register", path: "/register" },
  { name: "Chat", path: "/chat" },
];

export default function HeaderNavbar() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="hamburger-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </div>
          <h1 className="navbar-title">Account Marketplace</h1>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="sidebar-overlay"
              onClick={closeSidebar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.aside
              className="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./HeaderNavbar.css"; // 👈 CSS file we'll create next

export default function HeaderNavbar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Listing Panel", path: "/admin" },
    { name: "Register", path: "/register" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <header className="navbar-header">
      <h1 className="navbar-title">𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
      <nav className="navbar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="navbar-link-wrapper"
            >
              <Link
                to={item.path}
                className={`navbar-link ${isActive ? "active" : ""}`}
              >
                {item.name}
              </Link>
              {isActive && (
                <motion.div
                  layoutId="underline"
                  className="underline"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </nav>
    </header>
  );
}

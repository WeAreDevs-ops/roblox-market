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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-header">
      <h1 className="navbar-title">𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>

      {/* Desktop Navigation */}
      <nav className="navbar-nav desktop">
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

      {/* Hamburger Icon */}
      <div
        className="hamburger-icon"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="navbar-nav mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`navbar-link mobile-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

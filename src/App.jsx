import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';
import SellerLogin from './pages/SellerLogin';
import SellerListing from './pages/SellerListing';

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
        <nav>
          <Link to="/">Dashboard</Link> |{" "}
          <Link to="/admin">Admin Panel</Link> |{" "}
          <Link to="/register">Register</Link> |{" "}
          <Link to="/seller-login">Seller Login</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-listing" element={<SellerListing />} />
      </Routes>
    </BrowserRouter>
  );
}

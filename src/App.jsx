import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';
import SellerLogin from './pages/SellerLogin';
import SellerPanel from './pages/SellerPanel';

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
        <nav>
          <Link to="/">DASHBOARD</Link> |{" "}
          <Link to="/admin">LISTING</Link> |{" "}
          <Link to="/register">REGISTER</Link> |{" "}
          <Link to="/sellerlogin">SELLER LOGIN</Link> |{" "}
          <Link to="/sellerpanel">SELLER PANEL</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sellerlogin" element={<SellerLogin />} />
        <Route path="/sellerpanel" element={<SellerPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ParticlesBackground from './components/ParticlesBackground'; // ✅ New import

export default function App() {
  return (
    <BrowserRouter>
      <ParticlesBackground /> {/* ✅ Add the bubble background behind everything */}
      <header>
        <h1>𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
        <nav>
          <Link to="/">DASHBOARD</Link> | <Link to="/admin">LISTING</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

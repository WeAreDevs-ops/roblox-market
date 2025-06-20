import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <h1 className="title">𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/admin">Admin Panel</Link>
          <Link to="/register">Register</Link>
        </nav>

        <style>{`
          .header {
            padding: 20px;
            background-color: #202020;
            color: white;
            text-align: center;
          }

          .title {
            margin-bottom: 10px;
            font-size: 1.6rem;
          }

          .nav-links {
            display: flex;
            flex-direction: row;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .nav-links a {
            color: #ffd700;
            text-decoration: none;
            font-weight: bold;
          }

          .nav-links a:hover {
            text-decoration: underline;
          }

          @media (max-width: 600px) {
            .nav-links {
              flex-direction: column;
              gap: 8px;
            }
          }
        `}</style>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

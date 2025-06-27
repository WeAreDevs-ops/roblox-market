import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage'; // Import the ChatPage component

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
        <nav>
          <Link to="/">Dashboard</Link> |{" "}
          <Link to="/admin">Listing Panel</Link> |{" "}
          <Link to="/register">Register</Link> |{" "}
          <Link to="/chat">Chat</Link> {/* New link for ChatPage */}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatPage />} /> {/* New route for ChatPage */}
      </Routes>
    </BrowserRouter>
  );
}

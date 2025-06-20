import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';

export default function App() {
return (
<BrowserRouter>
<header>
<h1>𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗠𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲</h1>
<nav>
<Link to="/">Dashboard</Link> |{" "}
<Link to="/admin">Listing Panel</Link> |{" "}
<Link to="/register">Register</Link>
</nav>
</header>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/admin" element={<Admin />} />
<Route path="/register" element={<Register />} />
</Routes>
</BrowserRouter>
);
}

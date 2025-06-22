import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function SellerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/seller-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('seller', JSON.stringify(data));
        Swal.fire('Success', 'Login successful!', 'success');
        navigate('/seller-panel');
      } else {
        Swal.fire('Error', data.error || 'Login failed', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: 'white' }}>Seller Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="buy">Login</button>
      </form>
    </div>
  );
}

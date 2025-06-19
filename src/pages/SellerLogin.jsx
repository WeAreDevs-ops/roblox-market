import React, { useState } from 'react';

export default function SellerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const login = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('sellerToken', data.token);
      window.location.href = '/SellerPanel';
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seller Login</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <p>{message}</p>
    </div>
  );
}

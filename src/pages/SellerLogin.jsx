import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Firebase Client SDK

export default function SellerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = `${username}@rbxsm.com`; // Convert username to synthetic email

    try {
      await signInWithEmailAndPassword(auth, email, password);

      localStorage.setItem('seller', JSON.stringify({ username }));
      Swal.fire('Success', 'Login successful!', 'success');
      navigate('/seller-panel');
    } catch (err) {
      console.error('Firebase login error:', err.message);
      Swal.fire('Error', 'Invalid username or password', 'error');
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


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './SellerLogin.css';

export default function SellerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const email = `${username}@rbxsm.com`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('seller', JSON.stringify({ username }));
      Swal.fire('Success', 'Login successful!', 'success');
      navigate('/seller-panel');
    } catch (err) {
      console.error('Firebase login error:', err.message);
      Swal.fire('Error', 'Invalid username or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seller-login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">👤</div>
          <h2 className="login-title">Seller Login</h2>
          <p className="login-subtitle">Access your seller dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={e => setUsername(e.target.value)} 
              required 
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                🔐 Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </div>
    </div>
  );
}

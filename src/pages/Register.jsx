
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const email = `${form.username}@rbxsm.com`;

    try {
      await createUserWithEmailAndPassword(auth, email, form.password);
      Swal.fire('Success', 'Registration successful!', 'success');
      setForm({ username: '', password: '' });
    } catch (error) {
      console.error('Registration error:', error.message);
      let msg = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Username already taken';
      }
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">🧾</div>
          <h2 className="register-title">Register as a Seller</h2>
          <p className="register-subtitle">Join our marketplace and start selling today</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter a secure password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                🚀 Register Now
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="/seller-login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

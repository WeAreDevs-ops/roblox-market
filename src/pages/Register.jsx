import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { createUser WithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase client SDK
import './Register.css'; // Import a CSS file for styles

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = `${form.username}@rbxsm.com`; // Convert username to email

    try {
      await createUser WithEmailAndPassword(auth, email, form.password);
      Swal.fire('Success', 'Registration successful!', 'success');
    } catch (error) {
      console.error('Registration error:', error.message);
      let msg = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Username already taken';
      }
      Swal.fire('Error', msg, 'error');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">📝 Register as a Seller</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <input 
          className="register-input" 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          required 
        />
        <input 
          className="register-input" 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button className="register-button" type="submit">Register</button>
      </form>
    </div>
  );
}

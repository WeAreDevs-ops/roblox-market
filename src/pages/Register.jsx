import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Firebase client SDK

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = `${form.username}@rbxsm.com`; // Convert username to email

    try {
      await createUserWithEmailAndPassword(auth, email, form.password);
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
    <div className="container" style={{ marginTop: 40 }}>
      <h2 style={{ color: 'white' }}>📝 Register as a Seller</h2>
      <form onSubmit={handleRegister}>
        <input 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button className="buy" type="submit">Register</button>
      </form>
    </div>
  );
}

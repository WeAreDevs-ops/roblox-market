 import React, { useState } from 'react';
 import Swal from 'sweetalert2';
 import { createUserWithEmailAndPassword } from 'firebase/auth';
 import { auth } from '../../firebase'; // Firebase client SDK
 

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
  <div className="container" style={{
  marginTop: 40,
  backgroundColor: '#f0f0f0',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  }}>
  <h2 style={{
  color: '#333',
  textAlign: 'center',
  marginBottom: '20px'
  }}>📝 Register as a Seller</h2>
  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
  <input
  name="username"
  placeholder="Username"
  onChange={handleChange}
  required
  style={{
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px'
  }}
  />
  <input
  type="password"
  name="password"
  placeholder="Password"
  onChange={handleChange}
  required
  style={{
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px'
  }}
  />
  <button className="buy" type="submit" style={{
  backgroundColor: '#007bff',
  color: 'white',
  padding: '12px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px'
  }}>Register</button>
  </form>
  </div>
  );
 }
 

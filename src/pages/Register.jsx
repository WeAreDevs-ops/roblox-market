import React, { useState } from 'react';
import Swal from 'sweetalert2'; // ✅ Don't forget this

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();

    if (data.message) {
      Swal.fire('Success', data.message, 'success');
    } else {
      Swal.fire('Error', data.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="container" style={{ marginTop: 40 }}>
      <h2 style={{ color: 'white' }}>📝 Register as a Seller</h2>
      <form onSubmit={handleRegister}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button className="buy" type="submit">Register</button>
      </form>
    </div>
  );
}

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

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#282c34', // Dark background
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      maxWidth: '400px',
      margin: 'auto',
    },
    title: {
      color: '#61dafb', // Light blue color
      marginBottom: '20px',
      fontSize: '1.8rem',
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #61dafb', // Light blue border
      borderRadius: '5px',
      backgroundColor: '#fff', // White background for inputs
      fontSize: '1rem',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#61dafb', // Light blue background
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonHover: {
      backgroundColor: '#21a1f1', // Darker blue on hover
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Register as a Seller</h2>
      <form style={styles.form} onSubmit={handleRegister}>
        <input 
          style={styles.input} 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          required 
        />
        <input 
          style={styles.input} 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button 
          style={styles.button} 
          type="submit"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
        >
          Register
        </button>
      </form>
    </div>
  );
}

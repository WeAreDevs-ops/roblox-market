import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    username: '',
    age: '13+',
    email: 'Verified'
  });

  const login = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      setIsLoggedIn(true);
      fetchAccounts();
    } else {
      alert('Wrong password');
    }
  };

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data.accounts);
  };

  const addAccount = async () => {
    if (!form.username.trim()) {
      alert("Please enter a username.");
      return;
    }

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      fetchAccounts();
      setForm({ username: '', age: '13+', email: 'Verified' });
    } else {
      alert('Error adding account');
    }
  };

  const deleteAccount = async (id) => {
    const res = await fetch('/api/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      fetchAccounts();
    } else {
      alert('Error deleting account');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {!isLoggedIn ? (
        <>
          <h2>Admin Login</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button 
            onClick={login} 
            style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none' }}
          >
            Login
          </button>
        </>
      ) : (
        <>
          <h2>Add Account</h2>
          <input 
            type="text" 
            placeholder="Username" 
            value={form.username} 
            onChange={e => setForm({...form, username: e.target.value})} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <select 
            value={form.age} 
            onChange={e => setForm({...form, age: e.target.value})} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          >
            <option>13+</option>
            <option>{'<13'}</option>
          </select>
          <select 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          >
            <option>Verified</option>
            <option>Not Verified</option>
            <option>Add Email</option>
          </select>
          <button 
            onClick={addAccount} 
            style={{ padding: '10px 20px', background: 'green', color: '#fff', border: 'none' }}
          >
            Add Account
          </button>

          <h2 style={{ marginTop: '30px' }}>All Listings</h2>
          {accounts.length === 0 && <p>No accounts yet.</p>}
          {accounts.map(acc => (
            <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
              <p><strong>Username:</strong> {acc.username}</p>
              <p><strong>Age:</strong> {acc.age}</p>
              <p><strong>Email:</strong> {acc.email}</p>
              <button 
                onClick={() => deleteAccount(acc.id)} 
                style={{ padding: '5px 10px', background: 'red', color: '#fff', border: 'none' }}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
      }

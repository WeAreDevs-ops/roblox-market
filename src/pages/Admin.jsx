import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    username: '',
    age: '13+',
    email: 'Verified',
    profileLink: '',
    imageUrl: ''
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
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      fetchAccounts();
      setForm({
        username: '',
        age: '13+',
        email: 'Verified',
        profileLink: '',
        imageUrl: ''
      });
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

    if (res.ok) fetchAccounts();
  };

  return (
    <div className="container">
      {!isLoggedIn ? (
        <>
          <h2>Admin Login</h2>
          <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </>
      ) : (
        <>
          <h2>Add Account</h2>
          <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <select value={form.age} onChange={e => setForm({...form, age: e.target.value})}>
            <option>13+</option>
            <option>{'<13'}</option>
          </select>
          <select value={form.email} onChange={e => setForm({...form, email: e.target.value})}>
            <option>Verified</option>
            <option>Not Verified</option>
            <option>Add Email</option>
          </select>
          <input type="text" placeholder="Roblox Profile Link" value={form.profileLink} onChange={e => setForm({...form, profileLink: e.target.value})} />
          <input type="text" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
          <button onClick={addAccount}>Add Account</button>

          <h2>All Listings</h2>
          <ul>
            {accounts.map(acc => (
              <li key={acc.id}>
                {acc.username} ({acc.age}) — {acc.email} —
                <a href={acc.profileLink} target="_blank">Profile</a>
                <button onClick={() => deleteAccount(acc.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

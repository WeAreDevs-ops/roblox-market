import React, { useState, useEffect } from 'react';
import { fetchGamepassesByUsername } from './api/fetchGamepasses';  // ✅ fixed relative path

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [form, setForm] = useState({
    username: '',
    age: '13+',
    email: 'Verified',
    profile: '',
    price: '',
    mop: 'Gcash',
    negotiable: 'Yes',
    robuxBalance: '',
    limitedItems: '',
    inventory: 'Public',
    accountType: 'Global Account',
    games: ['', '', '']
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

  const fetchRobloxProfile = async (username) => {
    try {
      const res = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      });

      const data = await res.json();
      if (data?.data?.length > 0) {
        const userId = data.data[0].id;
        return `https://www.roblox.com/users/${userId}/profile`;
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching Roblox profile:", error);
      return "";
    }
  };

  const handleSubmit = async () => {
    if (!form.username.trim()) {
      alert("Please enter a username.");
      return;
    }

    let profileURL = form.profile;
    if (!editAccountId) {
      profileURL = await fetchRobloxProfile(form.username);
    }

    let fetchedGames = form.games;
    if (!editAccountId) {
      fetchedGames = await fetchGamepassesByUsername(form.username);
    }

    const newAccount = { ...form, profile: profileURL, games: fetchedGames };

    const requestMethod = editAccountId ? 'PUT' : 'POST';
    const requestBody = editAccountId ? { id: editAccountId, ...newAccount } : newAccount;

    const res = await fetch('/api/accounts', {
      method: requestMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (res.ok) {
      fetchAccounts();
      if (editAccountId) setEditAccountId(null);
      resetForm();
    } else {
      alert('Error saving account');
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

  const editAccount = (account) => {
    setEditAccountId(account.id);
    setForm(account);
  };

  const resetForm = () => {
    setForm({
      username: '',
      age: '13+',
      email: 'Verified',
      profile: '',
      price: '',
      mop: 'Gcash',
      negotiable: 'Yes',
      robuxBalance: '',
      limitedItems: '',
      inventory: 'Public',
      accountType: 'Global Account',
      games: ['', '', '']
    });
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
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
          <button onClick={login} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none' }}>
            Login
          </button>
        </>
      ) : (
        <>
          <h2>{editAccountId ? 'Edit Account' : 'Add Account'}</h2>

          <input 
            type="text" placeholder="Roblox Username" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <button 
            onClick={handleSubmit}
            style={{ padding: '10px 20px', background: editAccountId ? 'orange' : 'green', color: '#fff', border: 'none', marginTop: '10px' }}>
            {editAccountId ? 'Update Account' : 'Add Account'}
          </button>

          <h3 style={{ marginTop: '30px' }}>Account List</h3>

          <input 
            type="text" 
            placeholder="Search by username" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {filteredAccounts.map(acc => (
            <div key={acc.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
              <p><strong>{acc.username}</strong> - ₱{acc.price}</p>
              <button onClick={() => editAccount(acc)} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={() => deleteAccount(acc.id)} style={{ color: 'red' }}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
                             }

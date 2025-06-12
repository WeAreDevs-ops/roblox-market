import React, { useState, useEffect } from 'react';

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

    const newAccount = { ...form, profile: profileURL };

    if (editAccountId) {
      // Update existing account
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editAccountId, ...newAccount })
      });

      if (res.ok) {
        fetchAccounts();
        setEditAccountId(null);
        resetForm();
      } else {
        alert('Error updating account');
      }
    } else {
      // Create new account
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });

      if (res.ok) {
        fetchAccounts();
        resetForm();
      } else {
        alert('Error adding account');
      }
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

          <input 
            type="text" placeholder="Price (PHP)" value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <input 
            type="text" placeholder="Robux Balance" value={form.robuxBalance}
            onChange={e => setForm({...form, robuxBalance: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <input 
            type="text" placeholder="Limited Items" value={form.limitedItems}
            onChange={e => setForm({...form, limitedItems: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {[0,1,2].map(i => (
            <input 
              key={i}
              type="text" placeholder={`Game ${i+1}`} value={form.games[i] || ''}
              onChange={e => {
                const newGames = [...form.games];
                newGames[i] = e.target.value;
                setForm({...form, games: newGames});
              }}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          ))}

          <select value={form.age} onChange={e => setForm({...form, age: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>13+</option>
            <option>{'<13'}</option>
          </select>

          <select value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Verified</option>
            <option>Not Verified</option>
            <option>Add Email</option>
          </select>

          <select value={form.mop} onChange={e => setForm({...form, mop: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Gcash</option>
            <option>Paypal</option>
          </select>

          <select value={form.negotiable} onChange={e => setForm({...form, negotiable: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <select value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Public</option>
            <option>Private</option>
          </select>

          <select value={form.accountType} onChange={e => setForm({...form, accountType: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Global Account</option>
            <option>Vietnam Account</option>
          </select>

          <button 
            onClick={handleSubmit}
            style={{ padding: '10px 20px', background: editAccountId ? 'orange' : 'green', color: '#fff', border: 'none', marginTop: '10px' }}>
            {editAccountId ? 'Update Account' : 'Add Account'}
          </button>

          <h2 style={{ marginTop: '30px' }}>All Listings</h2>

          <input
            type="text"
            placeholder="Search Username"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {filteredAccounts.length === 0 && <p>No accounts found.</p>}
          {filteredAccounts.map(acc => (
            <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
              <p><strong>Username:</strong> {acc.username}</p>
              <p><strong>Age:</strong> {acc.age}</p>
              <p><strong>Email:</strong> {acc.email}</p>
              <p><strong>Price:</strong> ₱{acc.price}</p>
              <p><strong>MOP:</strong> {acc.mop}</p>
              <p><strong>Negotiable:</strong> {acc.negotiable}</p>
              <p><strong>Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>
              <p><strong>Robux Balance:</strong> {acc.robuxBalance}</p>
              <p><strong>Limited Items:</strong> {acc.limitedItems}</p>
              <p><strong>Inventory:</strong> {acc.inventory}</p>
              <p><strong>Account Type:</strong> {acc.accountType || 'Global Account'}</p>
              <p><strong>Games:</strong> {acc.games?.filter(g => g).join(", ")}</p>

              <button onClick={() => deleteAccount(acc.id)} style={{ padding: '5px 10px', background: 'red', color: '#fff', border: 'none', marginRight: '5px' }}>
                Delete
              </button>
              <button onClick={() => editAccount(acc)} style={{ padding: '5px 10px', background: 'blue', color: '#fff', border: 'none' }}>
                Edit
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
  }

import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
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

  const addAccount = async () => {
    if (!form.username.trim()) {
      alert("Please enter a username.");
      return;
    }

    // Fetch Roblox profile automatically
    const profileURL = await fetchRobloxProfile(form.username);

    const newAccount = {
      ...form,
      profile: profileURL
    };

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount)
    });

    if (res.ok) {
      fetchAccounts();
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
        games: ['', '', '']
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

    if (res.ok) {
      fetchAccounts();
    } else {
      alert('Error deleting account');
    }
  };

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

          {/* Username only now */}
          <input 
            type="text" placeholder="Roblox Username" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {/* Price */}
          <input 
            type="text" placeholder="Price (PHP)" value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {/* Robux Balance */}
          <input 
            type="text" placeholder="Robux Balance" value={form.robuxBalance}
            onChange={e => setForm({...form, robuxBalance: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {/* Limited Items */}
          <input 
            type="text" placeholder="Limited Items" value={form.limitedItems}
            onChange={e => setForm({...form, limitedItems: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {/* Games */}
          {[0,1,2].map(i => (
            <input 
              key={i}
              type="text" placeholder={`Game ${i+1}`} value={form.games[i]}
              onChange={e => {
                const newGames = [...form.games];
                newGames[i] = e.target.value;
                setForm({...form, games: newGames});
              }}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          ))}

          {/* Age */}
          <select value={form.age} onChange={e => setForm({...form, age: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>13+</option>
            <option>{'<13'}</option>
          </select>

          {/* Email */}
          <select value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Verified</option>
            <option>Not Verified</option>
            <option>Add Email</option>
          </select>

          {/* MOP */}
          <select value={form.mop} onChange={e => setForm({...form, mop: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Gcash</option>
            <option>Paypal</option>
          </select>

          {/* Negotiable */}
          <select value={form.negotiable} onChange={e => setForm({...form, negotiable: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Yes</option>
            <option>No</option>
          </select>

          {/* Inventory */}
          <select value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Public</option>
            <option>Private</option>
          </select>

          <button 
            onClick={addAccount}
            style={{ padding: '10px 20px', background: 'green', color: '#fff', border: 'none', marginTop: '10px' }}>
            Add Account
          </button>

          <h2 style={{ marginTop: '30px' }}>All Listings</h2>
          {accounts.length === 0 && <p>No accounts yet.</p>}
          {accounts.map(acc => (
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
              <p><strong>Games:</strong> {acc.games?.filter(g => g).join(", ")}</p>

              <button onClick={() => deleteAccount(acc.id)} 
                style={{ padding: '5px 10px', background: 'red', color: '#fff', border: 'none' }}>
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
    }

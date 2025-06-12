import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [newSeller, setNewSeller] = useState({ username: '', email: '', password: '' });
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
      fetchSellers();
    } else {
      alert('Wrong password');
    }
  };

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data.accounts);
  };

  const fetchSellers = async () => {
    const res = await fetch('/api/sellers');
    const data = await res.json();
    setSellers(data.sellers);
  };

  const addSeller = async () => {
    if (!newSeller.username || !newSeller.email || !newSeller.password) {
      alert("Please fill in all seller fields");
      return;
    }

    const res = await fetch('/api/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeller)
    });

    if (res.ok) {
      fetchSellers();
      setNewSeller({ username: '', email: '', password: '' });
    } else {
      alert('Failed to add seller');
    }
  };

  const deleteSeller = async (id) => {
    const res = await fetch('/api/sellers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      fetchSellers();
    } else {
      alert('Failed to delete seller');
    }
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
          {/* ---- EXISTING ACCOUNT MANAGEMENT (UNCHANGED) ---- */}
          {/* Your full existing code remains intact here... */}

          <h2 style={{ marginTop: '50px' }}>Seller Registration</h2>

          <input
            type="text"
            placeholder="Seller Username"
            value={newSeller.username}
            onChange={(e) => setNewSeller({ ...newSeller, username: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Seller Email"
            value={newSeller.email}
            onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Seller Password"
            value={newSeller.password}
            onChange={(e) => setNewSeller({ ...newSeller, password: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button
            onClick={addSeller}
            style={{ padding: '10px 20px', background: 'green', color: '#fff', border: 'none', marginBottom: '20px' }}
          >
            Add Seller
          </button>

          <h2>All Sellers</h2>
          {sellers.length === 0 && <p>No sellers found.</p>}
          {sellers.map((seller) => (
            <div key={seller.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p><strong>Username:</strong> {seller.username}</p>
              <p><strong>Email:</strong> {seller.email}</p>
              <button
                onClick={() => deleteSeller(seller.id)}
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

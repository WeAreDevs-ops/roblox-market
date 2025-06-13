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
    price: '',
    mop: 'Gcash',
    inventory: 'Public',
    robuxBalance: '',
    limitedItems: '',
    gamepass: '',
    accountType: 'Global Account',
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
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
      });

      const data = await res.json();
      if (data?.data?.length > 0) {
        const userId = data.data[0].id;
        return `https://www.roblox.com/users/${userId}/profile`;
      } else {
        return "";
      }
    } catch {
      return "";
    }
  };

  const handleSubmit = async () => {
    if (!form.username.trim()) {
      alert("Please enter a username.");
      return;
    }

    let profileURL = await fetchRobloxProfile(form.username);

    const newAccount = { ...form, profile: profileURL };

    const method = editAccountId ? 'PUT' : 'POST';
    const res = await fetch('/api/accounts', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editAccountId ? { id: editAccountId, ...newAccount } : newAccount)
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
      username: '', age: '13+', price: '', mop: 'Gcash',
      inventory: 'Public', robuxBalance: '', limitedItems: '',
      gamepass: '', accountType: 'Global Account'
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
          <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <button onClick={login} style={buttonStyle}>Login</button>
        </>
      ) : (
        <>
          <h2>{editAccountId ? 'Edit Account' : 'Add Account'}</h2>

          <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={inputStyle} />

          <select value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} style={inputStyle}>
            <option value="13+">13+</option>
            <option value="<13">&lt;13</option>
          </select>

          <input type="number" placeholder="Price (₱)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />

          <select value={form.mop} onChange={e => setForm({ ...form, mop: e.target.value })} style={inputStyle}>
            <option value="Gcash">Gcash</option>
            <option value="Paypal">Paypal</option>
          </select>

          <select value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} style={inputStyle}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>

          <input type="number" placeholder="Robux Balance" value={form.robuxBalance} onChange={e => setForm({ ...form, robuxBalance: e.target.value })} style={inputStyle} />

          <input type="number" placeholder="Limited / UGC" value={form.limitedItems} onChange={e => setForm({ ...form, limitedItems: e.target.value })} style={inputStyle} />

          <input type="text" placeholder="Gamepass (Name + Count)" value={form.gamepass} onChange={e => setForm({ ...form, gamepass: e.target.value })} style={inputStyle} />

          <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} style={inputStyle}>
            <option value="Global Account">Global Account</option>
            <option value="Vietnam Account">Vietnam Account</option>
          </select>

          <button onClick={handleSubmit} style={{
            padding: '10px 20px',
            background: editAccountId ? 'orange' : 'green',
            color: '#fff',
            border: 'none',
            marginTop: '10px'
          }}>
            {editAccountId ? 'Update Account' : 'Add Account'}
          </button>

          <h3>Accounts List</h3>
          <input type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputStyle} />

          {filteredAccounts.map(acc => (
            <div key={acc.id} style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px' }}>
              <b>{acc.username}</b> - ₱{acc.price}
              <div>Gamepass: {acc.gamepass || "N/A"}</div>
              <div>
                <button onClick={() => editAccount(acc)} style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => deleteAccount(acc.id)}>Delete</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px' };
const buttonStyle = { padding: '10px 20px', background: '#333', color: '#fff', border: 'none' };

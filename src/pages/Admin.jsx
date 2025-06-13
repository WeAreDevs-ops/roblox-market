import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Admin() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    username: '',
    age: '',
    email: '',
    price: '',
    mop: '',
    negotiable: 'Yes',
    robuxBalance: '',
    limitedItems: '',
    inventory: '',
    gamepass: '',
    accountType: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data.accounts);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts', form);
      setForm({
        username: '',
        age: '',
        email: '',
        price: '',
        mop: '',
        negotiable: 'Yes',
        robuxBalance: '',
        limitedItems: '',
        inventory: '',
        gamepass: '',
        accountType: ''
      });
      fetchAccounts();
    } catch (error) {
      console.error("Failed saving account", error);
      alert("Failed to save account.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      await axios.delete('/api/accounts', { data: { id } });
      fetchAccounts();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required /><br />
        <input type="text" name="age" placeholder="Age" value={form.age} onChange={handleChange} required /><br />
        <input type="text" name="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input type="text" name="price" placeholder="Price" value={form.price} onChange={handleChange} required /><br />
        <input type="text" name="mop" placeholder="Mode of Payment" value={form.mop} onChange={handleChange} required /><br />
        <select name="negotiable" value={form.negotiable} onChange={handleChange}>
          <option value="Yes">Negotiable: Yes</option>
          <option value="No">Negotiable: No</option>
        </select><br />
        <input type="text" name="robuxBalance" placeholder="Robux Balance" value={form.robuxBalance} onChange={handleChange} /><br />
        <input type="text" name="limitedItems" placeholder="Limited Items" value={form.limitedItems} onChange={handleChange} /><br />
        <input type="text" name="inventory" placeholder="Inventory" value={form.inventory} onChange={handleChange} /><br />
        <input type="text" name="gamepass" placeholder="Gamepass" value={form.gamepass} onChange={handleChange} /><br />
        <input type="text" name="accountType" placeholder="Account Type" value={form.accountType} onChange={handleChange} /><br />

        <button type="submit">Add Account</button>
      </form>

      <h3>Existing Accounts</h3>
      <ul>
        {accounts.map(acc => (
          <li key={acc.id}>
            {acc.username}
            <button onClick={() => handleDelete(acc.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

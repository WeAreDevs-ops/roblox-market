import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Admin() {
  const [formData, setFormData] = useState({
    username: "", age: "13+", email: "Verified", price: "", mop: "Gcash",
    negotiable: "Yes", robuxBalance: "", limitedItems: "", inventory: "Public",
    accountType: "Global Account", gamepass: ""
  });

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await axios.get('/api/accounts');
    setAccounts(res.data.accounts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts', formData);
      Swal.fire("Success!", "Account Saved!", "success");
      fetchAccounts();
      setFormData({
        username: "", age: "13+", email: "Verified", price: "", mop: "Gcash",
        negotiable: "Yes", robuxBalance: "", limitedItems: "", inventory: "Public",
        accountType: "Global Account", gamepass: ""
      });
    } catch {
      Swal.fire("Error!", "Failed saving account", "error");
    }
  };

  const deleteAccount = async (id) => {
    await axios.delete('/api/accounts', { data: { id } });
    Swal.fire("Deleted!", "Account removed", "success");
    fetchAccounts();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
        <input name="robuxBalance" placeholder="Robux Balance" value={formData.robuxBalance} onChange={handleChange} />
        <input name="limitedItems" placeholder="Limited Items" value={formData.limitedItems} onChange={handleChange} />
        <input name="gamepass" placeholder="Gamepass (ex: Blox Fruit (2))" value={formData.gamepass} onChange={handleChange} />

        <button type="submit">Save Account</button>
      </form>

      <h3>Listed Accounts</h3>
      {accounts.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <h4>{acc.username}</h4>
          <button onClick={() => deleteAccount(acc.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

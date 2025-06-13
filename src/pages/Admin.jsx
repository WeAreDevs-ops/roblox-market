import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [formData, setFormData] = useState({
    username: "",
    age: "13+",
    email: "Verified",
    price: "",
    mop: "Gcash",
    negotiable: "Yes",
    robuxBalance: "",
    limitedItems: "",
    inventory: "Public",
    gamepass: "",
    accountType: "Global Account",
    password: ""
  });

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data.accounts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire('Success', 'Account added!', 'success');
        setFormData({
          username: "",
          age: "13+",
          email: "Verified",
          price: "",
          mop: "Gcash",
          negotiable: "Yes",
          robuxBalance: "",
          limitedItems: "",
          inventory: "Public",
          gamepass: "",
          accountType: "Global Account",
          password: ""
        });
        fetchAccounts();
      } else {
        Swal.fire('Error', 'Failed to add account', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'An unexpected error occurred', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        Swal.fire('Deleted!', 'Account deleted successfully.', 'success');
        fetchAccounts();
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to delete account', 'error');
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Admin Panel</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label>
          <input type="text" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Age:</label>
          <select name="age" value={formData.age} onChange={handleChange}>
            <option value="13+">13+</option>
            <option value="Under 13">Under 13</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <select name="email" value={formData.email} onChange={handleChange}>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Price:</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Mode of Payment (MOP):</label>
          <select name="mop" value={formData.mop} onChange={handleChange}>
            <option value="Gcash">Gcash</option>
            <option value="Paymaya">Paymaya</option>
            <option value="Paypal">Paypal</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Negotiable:</label>
          <select name="negotiable" value={formData.negotiable} onChange={handleChange}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Robux Balance:</label>
          <input type="number" name="robuxBalance" value={formData.robuxBalance} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Limited Items:</label>
          <input type="number" name="limitedItems" value={formData.limitedItems} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Inventory:</label>
          <select name="inventory" value={formData.inventory} onChange={handleChange}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Gamepass:</label>
          <input type="text" name="gamepass" value={formData.gamepass} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Account Type:</label>
          <select name="accountType" value={formData.accountType} onChange={handleChange}>
            <option value="Global Account">Global Account</option>
            <option value="PH Account">PH Account</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
          Add Account
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h3>Account List</h3>

      <input type="text" placeholder="Search Username" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: "10px", padding: "5px", width: "100%", maxWidth: "300px" }} />

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          <strong>{acc.username}</strong> - ₱{acc.price}
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => handleDelete(acc.id)} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", marginRight: "10px" }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
          }

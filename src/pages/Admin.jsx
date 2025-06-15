import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    totalSummary: "",
    age: "13+",
    email: "Verified",
    price: "",
    mop: "Gcash",
    negotiable: "Yes",
    robuxBalance: "",
    limitedItems: "",
    inventory: "Public",
    gamepass: "",
    accountType: "Global Account"
  });

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (isAuthorized) fetchAccounts();
  }, [isAuthorized]);

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data.accounts);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });

      if (response.ok) {
        setIsAuthorized(true);
      } else {
        Swal.fire("Access Denied", "Invalid admin password!", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to login!", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/accounts';
      const method = editMode ? 'PUT' : 'POST';
      const payload = editMode ? { id: editId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire('Success', editMode ? 'Account updated!' : 'Account added!', 'success');
        setFormData({
          username: "",
          totalSummary: "",
          age: "13+",
          email: "Verified",
          price: "",
          mop: "Gcash",
          negotiable: "Yes",
          robuxBalance: "",
          limitedItems: "",
          inventory: "Public",
          gamepass: "",
          accountType: "Global Account"
        });
        setEditMode(false);
        setEditId(null);
        fetchAccounts();
      } else {
        Swal.fire('Error', 'Failed to save account', 'error');
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

  const handleEdit = (account) => {
    setFormData({
      username: account.username || "",
      totalSummary: account.totalSummary || "",
      age: account.age || "13+",
      email: account.email || "Verified",
      price: account.price || "",
      mop: account.mop || "Gcash",
      negotiable: account.negotiable || "Yes",
      robuxBalance: account.robuxBalance || "",
      limitedItems: account.limitedItems || "",
      inventory: account.inventory || "Public",
      gamepass: account.gamepass || "",
      accountType: account.accountType || "Global Account"
    });
    setEditMode(true);
    setEditId(account.id);
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="container" style={{ padding: "20px" }}>
        <h2>Admin Panel Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          style={{ marginBottom: "10px", padding: "10px", width: "300px" }}
        />
        <br />
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>Login</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Total Summary:</label>
          <input type="text" name="totalSummary" value={formData.totalSummary} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Age:</label>
          <select name="age" value={formData.age} onChange={handleChange}>
            <option value="13+">13+</option>
            <option value="<13">&lt;13</option>
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
          <label>MOP:</label>
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
          <label>Game with Gamepass:</label>
          <input type="text" name="gamepass" value={formData.gamepass} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Account Type:</label>
          <select name="accountType" value={formData.accountType} onChange={handleChange}>
            <option value="GLOBAL">GLOBAL</option>
            <option value="VIETNAM">VIETNAM</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
          {editMode ? "Update Account" : "Add Account"}
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h3>Account List</h3>

      <input type="text" placeholder="Search Username" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: "10px", padding: "5px", width: "100%", maxWidth: "300px" }} />

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          <strong>{acc.username}</strong> - ₱{acc.price}
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => handleEdit(acc)} style={{ background: "orange", color: "white", border: "none", padding: "5px 10px", marginRight: "10px" }}>
              Edit
            </button>
            <button onClick={() => handleDelete(acc.id)} style={{ background: "red", color: "white", border: "none", padding: "5px 10px" }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
              }

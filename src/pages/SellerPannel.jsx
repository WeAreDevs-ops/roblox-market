import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function SellerPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sellerUsername, setSellerUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    totalSummary: "",
    email: "Verified",
    price: "",
    mop: "Gcash",
    robuxBalance: "",
    limitedItems: "",
    inventory: "Public",
    gamepass: "",
    accountType: "Global Account",
    premium: "False"
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) {
      const parsed = JSON.parse(storedSeller);
      setIsAuthenticated(true);
      setSellerUsername(parsed.username);
      fetchAccounts(parsed.username);
    }
  }, []);

  const fetchAccounts = async (username) => {
    try {
      const res = await fetch('/api/seller-accounts?username=' + username);
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/seller-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: sellerUsername, password })
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('seller', JSON.stringify({ username: sellerUsername }));
        fetchAccounts(sellerUsername);
      } else {
        Swal.fire('Unauthorized', data.error || 'Login failed', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong during login', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        owner: sellerUsername
      };

      const url = editMode ? '/api/seller-accounts' : '/api/seller-accounts';
      const method = editMode ? 'PUT' : 'POST';

      if (editMode) payload.id = editId;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('Success', editMode ? 'Updated!' : 'Added!', 'success');
        fetchAccounts(sellerUsername);
        setFormData({
          username: "",
          totalSummary: "",
          email: "Verified",
          price: "",
          mop: "Gcash",
          robuxBalance: "",
          limitedItems: "",
          inventory: "Public",
          gamepass: "",
          accountType: "Global Account",
          premium: "False"
        });
        setEditMode(false);
        setEditId(null);
      } else {
        const errData = await res.json();
        Swal.fire('Error', errData.error || 'Failed to save account', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      const res = await fetch('/api/seller-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        Swal.fire('Deleted', 'Listing removed', 'success');
        fetchAccounts(sellerUsername);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const handleEdit = (acc) => {
    setEditMode(true);
    setEditId(acc.id);
    setFormData({
      username: acc.username || "",
      totalSummary: acc.totalSummary || "",
      email: acc.email || "Verified",
      price: acc.price || "",
      mop: acc.mop || "Gcash",
      robuxBalance: acc.robuxBalance || "",
      limitedItems: acc.limitedItems || "",
      inventory: acc.inventory || "Public",
      gamepass: acc.gamepass || "",
      accountType: acc.accountType || "Global Account",
      premium: acc.premium || "False"
    });
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: "20px" }}>
        <h2>Seller Login</h2>
        <input type="text" placeholder="Username" value={sellerUsername} onChange={(e) => setSellerUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>Seller Panel ({sellerUsername})</h2>

      <form onSubmit={handleSubmit}>
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
        <input name="totalSummary" value={formData.totalSummary} onChange={handleChange} placeholder="Total Summary" />
        <select name="email" value={formData.email} onChange={handleChange}>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
        </select>
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
        <select name="mop" value={formData.mop} onChange={handleChange}>
          <option value="Gcash">Gcash</option>
          <option value="Paymaya">Paymaya</option>
          <option value="Paypal">Paypal</option>
        </select>
        <input type="number" name="robuxBalance" value={formData.robuxBalance} onChange={handleChange} placeholder="Robux" />
        <input type="number" name="limitedItems" value={formData.limitedItems} onChange={handleChange} placeholder="Limited Items" />
        <select name="inventory" value={formData.inventory} onChange={handleChange}>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
        <input name="gamepass" value={formData.gamepass} onChange={handleChange} placeholder="Gamepass" />
        <select name="accountType" value={formData.accountType} onChange={handleChange}>
          <option value="GLOBAL">GLOBAL</option>
          <option value="VIETNAM">VIETNAM</option>
        </select>
        <select name="premium" value={formData.premium} onChange={handleChange}>
          <option value="True">True</option>
          <option value="False">False</option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : editMode ? "Update" : "Add"}
        </button>
      </form>

      <input
        type="text"
        placeholder="Search Username"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: "20px 0", padding: "5px" }}
      />

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <strong>{acc.username}</strong> - ₱{acc.price}
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => handleEdit(acc)} style={{ marginRight: "10px" }}>Edit</button>
            <button onClick={() => handleDelete(acc.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
          }

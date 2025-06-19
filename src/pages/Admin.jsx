import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase'; // your firebase init

const auth = getAuth(app);

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [uid, setUid] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
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

  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUid(user.uid);
        setIsSeller(true);
        fetchAccounts(user.uid, token);
      }
    });
  }, []);

  const fetchAccounts = async (uid = null, token = null) => {
    const res = await fetch('/api/accounts', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = await res.json();
    const all = data.accounts || [];
    const filtered = isSeller ? all.filter(acc => acc.sellerId === uid) : all;
    setAccounts(filtered);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });

      if (response.ok) {
        setIsAdmin(true);
        fetchAccounts(); // admin sees all
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();

      const url = '/api/accounts';
      const method = editMode ? 'PUT' : 'POST';
      const payload = editMode ? { id: editId, ...formData } : { ...formData, sellerId: uid };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire('Success', editMode ? 'Account updated!' : 'Account added!', 'success');
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
        fetchAccounts(uid, token);
      } else if (response.status === 409) {
        Swal.fire('Error', 'Username already exists', 'error');
      } else {
        Swal.fire('Error', 'Failed to save account', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        Swal.fire('Deleted!', 'Account deleted successfully.', 'success');
        fetchAccounts(uid, token);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to delete account', 'error');
    }
  };

  const handleEdit = (acc) => {
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
    setEditMode(true);
    setEditId(acc.id);
  };

  const filtered = accounts.filter(acc => acc.username.toLowerCase().includes(search.toLowerCase()));

  if (!isAdmin && !isSeller) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Admin Panel Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>{isAdmin ? "Admin Panel" : "Seller Panel"}</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
        <input name="totalSummary" value={formData.totalSummary} onChange={handleChange} placeholder="Summary" />
        <input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="₱ Price" required />
        <button type="submit" disabled={isSubmitting}>{editMode ? "Update" : "Add"} Account</button>
      </form>
      <hr />
      <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.map(acc => (
        <div key={acc.id}>
          <strong>{acc.username}</strong> - ₱{acc.price}
          <div>
            <button onClick={() => handleEdit(acc)}>Edit</button>
            <button onClick={() => handleDelete(acc.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
        }

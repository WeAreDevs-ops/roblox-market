import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [seller, setSeller] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ username: '', password: '' });
  const [listingType, setListingType] = useState('account');

  const initialFormData = {
    // Account Listing fields
    username: '',
    totalSummary: '',
    email: 'Verified',
    price: '',
    mop: 'Gcash',
    robuxBalance: '',
    limitedItems: '',
    inventory: 'Public',
    gamepass: '',
    accountType: 'Global Account',
    premium: 'False',
    facebookLink: '',
    // Robux Listing fields
    robux: '',
    via: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSeller = !!seller;

  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  useEffect(() => {
    if (isAuthorized || isSeller) fetchAccounts();
  }, [isAuthorized, seller, listingType]);

  const fetchAccounts = async () => {
    const res = await fetch(`/api/${listingType === 'robux' ? 'robux' : 'accounts'}`);
    const data = await res.json();
    if (isSeller) {
      const username = JSON.parse(localStorage.getItem('seller'))?.username;
      const sellerListings = data.accounts.filter(acc => acc.seller === username);
      setAccounts(sellerListings);
    } else {
      setAccounts(data.accounts);
    }
  };

  const handleAdminLogin = async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword }),
    });
    if (response.ok) {
      setIsAuthorized(true);
      Swal.fire('Access Granted', 'Welcome admin!', 'success');
    } else {
      Swal.fire('Access Denied', 'Invalid admin password!', 'error');
    }
  };

  const handleSellerLogin = async (e) => {
    e.preventDefault();
    const { username, password } = sellerLogin;
    const response = await fetch('/api/seller-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      const sellerData = { username: username.trim() };
      localStorage.setItem('seller', JSON.stringify(sellerData));
      setSeller(sellerData);
      Swal.fire('Welcome!', 'Seller login successful', 'success');
    } else {
      Swal.fire('Login Failed', data.error || 'Invalid login', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthorized(false);
    setAccounts([]);
    Swal.fire('Logged out', 'You have been logged out.', 'success');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = listingType === 'robux'
      ? {
          ...(editMode ? { id: editId } : {}),
          robux: formData.robux,
          via: formData.via,
          facebookLink: formData.facebookLink,
          seller: seller?.username || ''
        }
      : {
          ...(editMode ? { id: editId } : {}),
          ...formData,
          ...(isSeller ? { seller: seller.username } : {})
        };

    try {
      const response = await fetch(`/api/${listingType === 'robux' ? 'robux' : 'accounts'}`, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isSeller && { Authorization: seller.username })
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire('Success', editMode ? 'Updated!' : 'Added!', 'success');
        setFormData(initialFormData);
        setEditMode(false);
        setEditId(null);
        fetchAccounts();
      } else {
        Swal.fire('Error', 'Failed to save', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Unexpected error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    const res = await fetch(`/api/${listingType === 'robux' ? 'robux' : 'accounts'}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      Swal.fire('Deleted!', 'Successfully deleted.', 'success');
      fetchAccounts();
    }
  };

  const handleEdit = (acc) => {
    setFormData({ ...initialFormData, ...acc });
    setEditMode(true);
    setEditId(acc.id);
  };

  const filtered = accounts.filter(acc =>
    acc.username?.toLowerCase().includes(search.toLowerCase()) ||
    acc.seller?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthorized && !seller) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2 style={{ color: 'white' }}>Admin Login</h2>
        <input type="password" placeholder="Enter admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
        <button onClick={handleAdminLogin}>Login</button>
        <hr />
        <h2 style={{ color: 'white' }}>Seller Login</h2>
        <form onSubmit={handleSellerLogin}>
          <input type="text" name="username" placeholder="Username" value={sellerLogin.username} onChange={e => setSellerLogin({ ...sellerLogin, username: e.target.value })} />
          <input type="password" name="password" placeholder="Password" value={sellerLogin.password} onChange={e => setSellerLogin({ ...sellerLogin, password: e.target.value })} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2 style={{ color: 'white' }}>
        {isAuthorized ? 'Admin Panel' : `${seller?.username}'s Panel`}
        <button onClick={handleLogout} style={{ marginLeft: '20px', background: 'red', color: '#fff' }}>Logout</button>
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setListingType('account')} style={{ marginRight: '10px' }}>Account Listing</button>
        <button onClick={() => setListingType('robux')}>Robux Listing</button>
      </div>

      <form onSubmit={handleSubmit}>
        {listingType === 'robux' ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Robux:</label>
              <input type="text" name="robux" value={formData.robux} onChange={handleChange} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Via:</label>
              <input type="text" name="via" value={formData.via} onChange={handleChange} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link:</label>
              <input type="text" name="facebookLink" value={formData.facebookLink} onChange={handleChange} />
            </div>
          </>
        ) : (
          ['username', 'totalSummary', 'email', 'price', 'mop', 'robuxBalance', 'limitedItems', 'inventory', 'gamepass', 'accountType', 'premium', 'facebookLink'].map(name => (
            <div key={name} style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>{name}:</label>
              <input type="text" name={name} value={formData[name]} onChange={handleChange} />
            </div>
          ))
        )}
        <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#22c55e', color: 'white' }}>
          {isSubmitting ? 'Processing...' : editMode ? 'Update' : 'Add'}
        </button>
      </form>

      <hr />
      <h3 style={{ color: 'white' }}>Listings</h3>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />

      {filtered.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', color: 'white' }}>
          {listingType === 'robux' ? (
            <>
              <strong>Robux:</strong> {acc.robux}<br />
              <strong>Via:</strong> {acc.via}<br />
              <strong>Contact:</strong> <a href={acc.facebookLink} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>{acc.facebookLink}</a><br />
              <strong>Seller:</strong> {acc.seller}
            </>
          ) : (
            <>
              <strong>{acc.username}</strong> - ₱{acc.price}<br />
              Email: {acc.email} | Premium: {acc.premium}<br />
              MOP: {acc.mop} | Inventory: {acc.inventory}<br />
              Gamepass: {acc.gamepass} | Type: {acc.accountType}<br />
              Limited: {acc.limitedItems} | Robux: {acc.robuxBalance}<br />
              Contact: <a href={acc.facebookLink} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>{acc.facebookLink}</a>
            </>
          )}
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => handleEdit(acc)} style={{ background: 'orange', color: 'white', marginRight: '10px' }}>Edit</button>
            <button onClick={() => handleDelete(acc.id)} style={{ background: 'red', color: 'white' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
    }

// Admin.jsx (Part 1/4)

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [seller, setSeller] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ username: '', password: '' });
  const [formType, setFormType] = useState('account');

  // Account form state
  const [formData, setFormData] = useState({
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
    facebookLink: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robux listing state
  const [robuxListings, setRobuxListings] = useState([]);
  const [robuxFormData, setRobuxFormData] = useState({
    amount: '',
    via: '',
    price: '',
    contact: ''
  });
  const [robuxEditMode, setRobuxEditMode] = useState(false);
  const [robuxEditId, setRobuxEditId] = useState(null);
  const [isRobuxSubmitting, setIsRobuxSubmitting] = useState(false);

  const isSeller = !!seller;

  // === Limited Item Listing State ===
  const [limitedFormData, setLimitedFormData] = useState({
    assetId: '',
    price: '',
    contact: '',
    poisonStatus: 'Safe',
  });
  const [limitedItemDetails, setLimitedItemDetails] = useState(null);
  const [limitedItems, setLimitedItems] = useState([]);
  const [isLimitedSubmitting, setIsLimitedSubmitting] = useState(false);

  // Load seller from localStorage on mount
  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  useEffect(() => {
    if (isAuthorized || isSeller) {
      fetchAccounts();
      fetchRobuxListings();
      fetchLimitedItems();
    }
  }, [isAuthorized, seller]);

  // Fetch functions
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (isSeller) {
        const username = seller?.username;
        setAccounts(data.accounts.filter(acc => acc.seller === username));
      } else {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchRobuxListings = async () => {
    try {
      const res = await fetch('/api/robux');
      const data = await res.json();
      if (res.ok) {
        if (isSeller) {
          const username = seller?.username;
          setRobuxListings(data.robuxList.filter(item => item.seller === username));
        } else {
          setRobuxListings(data.robuxList);
        }
      }
    } catch (error) {
      console.error('Failed to fetch robux listings:', error);
    }
  };

  const fetchLimitedItems = async () => {
    try {
      const res = await fetch('/api/limited-items');
      const data = await res.json();
      if (res.ok) {
        if (isSeller) {
          const username = seller?.username;
          setLimitedItems(data.items.filter(item => item.seller === username));
        } else {
          setLimitedItems(data.items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch limited items:', err);
    }
  };

  const fetchLimitedItemDetails = async (assetId) => {
    try {
      const res = await fetch(`/api/roblox/asset/${assetId}`);
      const data = await res.json();
      if (res.ok && data?.name) {
        setLimitedItemDetails(data);
      } else {
        Swal.fire('Error', 'Invalid asset ID or not a limited item.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch asset info.', 'error');
    }
  };

  const handleLimitedChange = (e) => {
    const { name, value } = e.target;
    setLimitedFormData(prev => ({ ...prev, [name]: value }));
  };// Admin.jsx (Part 2/4)

  const handleAdminLogin = async () => {
    try {
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
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to login!', 'error');
    }
  };

  const handleSellerLogin = async (e) => {
    e.preventDefault();
    const { username, password } = sellerLogin;

    if (!username || !password) {
      Swal.fire('Missing Fields', 'Please enter both username and password.', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/seller-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Welcome!', 'Seller login successful', 'success');
        const sellerData = { username: username.trim() };
        localStorage.setItem('seller', JSON.stringify(sellerData));
        setSeller(sellerData);
      } else {
        Swal.fire('Login Failed', data.error || 'Invalid login', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthorized(false);
    setAccounts([]);
    setRobuxListings([]);
    Swal.fire('Logged out', 'You have been logged out.', 'success');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const requiredFields = [
      'username',
      'price',
      'robuxBalance',
      'limitedItems',
      'gamepass',
      'facebookLink'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Swal.fire('Missing Field', `Please fill out the "${field}" field.`, 'warning');
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      ...(editMode ? { id: editId } : {}),
      ...formData,
      ...(isSeller ? { seller: seller.username } : {}),
    };

    try {
      const response = await fetch('/api/accounts', {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isSeller && { Authorization: seller.username })
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire('Success', editMode ? 'Account updated!' : 'Account added!', 'success');
        setFormData({
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
          facebookLink: ''
        });
        setEditMode(false);
        setEditId(null);
        fetchAccounts();
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
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
      username: account.username || '',
      totalSummary: account.totalSummary || '',
      email: account.email || 'Verified',
      price: account.price || '',
      mop: account.mop || 'Gcash',
      robuxBalance: account.robuxBalance || '',
      limitedItems: account.limitedItems || '',
      inventory: account.inventory || 'Public',
      gamepass: account.gamepass || '',
      accountType: account.accountType || 'Global Account',
      premium: account.premium || 'False',
      facebookLink: account.facebookLink || ''
    });
    setEditMode(true);
    setEditId(account.id);
  };

  const handleRobuxChange = (e) => {
    const { name, value } = e.target;
    setRobuxFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRobuxSubmit = async (e) => {
    e.preventDefault();
    if (isRobuxSubmitting) return;
    setIsRobuxSubmitting(true);

    const { amount, via, price, contact } = robuxFormData;

    if (!amount.trim() || !via.trim() || !price.trim() || !contact.trim()) {
      Swal.fire('Missing Fields', 'Please fill out all Robux listing fields.', 'warning');
      setIsRobuxSubmitting(false);
      return;
    }

    const payload = {
      ...(robuxEditMode ? { id: robuxEditId } : {}),
      amount,
      via,
      price,
      contact,
      seller: seller?.username || 'admin'
    };

    try {
      const method = robuxEditMode ? 'PUT' : 'POST';
      const res = await fetch('/api/robux', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('Success', robuxEditMode ? 'Robux listing updated!' : 'Robux listing added!', 'success');
        setRobuxFormData({ amount: '', via: '', price: '', contact: '' });
        setRobuxEditMode(false);
        setRobuxEditId(null);
        fetchRobuxListings();
      } else {
        Swal.fire('Error', 'Failed to save Robux listing.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'An unexpected error occurred.', 'error');
    } finally {
      setIsRobuxSubmitting(false);
    }
  };// Admin.jsx (Part 3/4)

  const handleRobuxDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Robux listing?')) return;

    try {
      const res = await fetch('/api/robux', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        Swal.fire('Deleted', 'Robux listing deleted.', 'success');
        fetchRobuxListings();
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to delete Robux listing.', 'error');
    }
  };

  const handleRobuxEdit = (listing) => {
    setRobuxFormData({
      amount: listing.amount || '',
      via: listing.via || '',
      price: listing.price || '',
      contact: listing.contact || ''
    });
    setRobuxEditMode(true);
    setRobuxEditId(listing.id);
  };

  const handleLimitedSubmit = async (e) => {
    e.preventDefault();
    if (isLimitedSubmitting) return;
    setIsLimitedSubmitting(true);

    const { assetId, price, contact, poisonStatus } = limitedFormData;

    if (!assetId.trim() || !price.trim() || !contact.trim()) {
      Swal.fire('Missing Fields', 'All fields are required.', 'warning');
      setIsLimitedSubmitting(false);
      return;
    }

    await fetchLimitedItemDetails(assetId);

    if (!limitedItemDetails || !limitedItemDetails.name) {
      setIsLimitedSubmitting(false);
      return;
    }

    const payload = {
      assetId,
      name: limitedItemDetails.name,
      creator: limitedItemDetails.creator,
      thumbnail: limitedItemDetails.thumbnail,
      itemType: limitedItemDetails.itemType,
      originalPrice: limitedItemDetails.originalPrice || null,
      price,
      contact,
      poisonStatus,
      seller: seller?.username || 'admin',
    };

    try {
      const res = await fetch('/api/limited-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire('Success', 'Limited item listed!', 'success');
        setLimitedFormData({ assetId: '', price: '', contact: '', poisonStatus: 'Safe' });
        setLimitedItemDetails(null);
        fetchLimitedItems();
      } else {
        Swal.fire('Error', 'Failed to save limited item.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Unexpected error occurred.', 'error');
    } finally {
      setIsLimitedSubmitting(false);
    }
  };

  // === RENDER ===
  if (!isAuthorized && !seller) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2 style={{ color: 'white' }}>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <button onClick={handleAdminLogin}>Login</button>

        <hr style={{ margin: '30px 0' }} />
        <h2 style={{ color: 'white' }}>Seller Login</h2>
        <form onSubmit={handleSellerLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={sellerLogin.username}
            required
            onChange={e => setSellerLogin({ ...sellerLogin, username: e.target.value })}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={sellerLogin.password}
            required
            onChange={e => setSellerLogin({ ...sellerLogin, password: e.target.value })}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
            }// Admin.jsx (Part 4/4)

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2 style={{ color: 'white' }}>
        {isAuthorized ? 'Admin Panel' : `${seller?.username}'s Panel`}
        <button
          onClick={handleLogout}
          style={{ marginLeft: '20px', background: 'red', color: '#fff' }}
        >
          Logout
        </button>
      </h2>

      {/* FORM TOGGLE BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFormType('account')}
          style={{
            padding: '10px 25px',
            backgroundColor: formType === 'account' ? '#4CAF50' : '#e0e0e0',
            color: formType === 'account' ? 'white' : 'black',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          ACCOUNT LISTING FORM
        </button>
        <button
          onClick={() => setFormType('robux')}
          style={{
            padding: '10px 20px',
            backgroundColor: formType === 'robux' ? '#2196F3' : '#e0e0e0',
            color: formType === 'robux' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          ROBUX LISTING FORM
        </button>
        <button
          onClick={() => setFormType('limited')}
          style={{
            padding: '10px 20px',
            backgroundColor: formType === 'limited' ? '#8e44ad' : '#e0e0e0',
            color: formType === 'limited' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          LIMITED ITEM LISTING FORM
        </button>
      </div>

      {/* === LIMITED ITEM FORM === */}
      {formType === 'limited' && (
        <>
          <form onSubmit={handleLimitedSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Asset ID:</label>
              <input
                type="text"
                name="assetId"
                value={limitedFormData.assetId}
                onChange={handleLimitedChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Price (₱):</label>
              <input
                type="number"
                name="price"
                value={limitedFormData.price}
                onChange={handleLimitedChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link:</label>
              <input
                type="url"
                name="contact"
                value={limitedFormData.contact}
                onChange={handleLimitedChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Status:</label>
              <select
                name="poisonStatus"
                value={limitedFormData.poisonStatus}
                onChange={handleLimitedChange}
              >
                <option value="Safe">Safe</option>
                <option value="Poison">Poison</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLimitedSubmitting}
              style={{
                backgroundColor: '#8e44ad',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isLimitedSubmitting ? 'Processing...' : 'Add Limited Item'}
            </button>
          </form>

          <h3 style={{ color: 'white' }}>Listed Limited Items</h3>
          {limitedItems.map(item => (
            <div key={item.id} style={{ background: '#222', padding: '10px', marginBottom: '10px', borderRadius: '8px', color: 'white' }}>
              <img src={item.thumbnail} alt="thumb" width="80" style={{ borderRadius: '8px' }} />
              <div><strong>{item.name}</strong> by {item.creator}</div>
              <div>Type: {item.itemType}</div>
              <div>Original Robux Price: {item.originalPrice || 'N/A'}</div>
              <div>Sale Price: ₱{item.price}</div>
              <div>Status: {item.poisonStatus}</div>
              <div>Contact: <a href={item.contact} target="_blank" rel="noopener noreferrer">{item.contact}</a></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Admin.css';

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

  // Load seller from localStorage on mount
  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  // Fetch accounts and robux listings on login state change
  useEffect(() => {
    if (isAuthorized || isSeller) {
      fetchAccounts();
      fetchRobuxListings();
    }
  }, [isAuthorized, seller]);

  // Fetch accounts API call
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

  // Fetch robux listings API call
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

  // Admin login handler
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

  // Seller login handler
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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthorized(false);
    setAccounts([]);
    setRobuxListings([]);
    Swal.fire('Logged out', 'You have been logged out.', 'success');
  };

  // Account form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Account form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Required fields check
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

  // Account delete handler
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

  // Account edit handler
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

  // Robux form input change handler
  const handleRobuxChange = (e) => {
    const { name, value } = e.target;
    setRobuxFormData(prev => ({ ...prev, [name]: value }));
  };

  // Robux form submit handler (Add or Update)
  const handleRobuxSubmit = async (e) => {
    e.preventDefault();
    if (isRobuxSubmitting) return;
    setIsRobuxSubmitting(true);

    const { amount, via, price, contact } = robuxFormData;

    // Validate required fields
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
  };

  // Robux delete handler
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

  // Robux edit handler
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

  // Render login screen if not authorized nor seller
  if (!isAuthorized && !seller) {
    return (
      <div className="admin-container">
        <div className="login-card">
          <div className="login-section">
            <h2 className="login-title">🔐 Admin Login</h2>
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="form-input"
              />
              <button onClick={handleAdminLogin} className="btn btn-primary">
                Login as Admin
              </button>
            </div>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="login-section">
            <h2 className="login-title">👤 Seller Login</h2>
            <form onSubmit={handleSellerLogin} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={sellerLogin.username}
                  required
                  onChange={e => setSellerLogin({ ...sellerLogin, username: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={sellerLogin.password}
                  required
                  onChange={e => setSellerLogin({ ...sellerLogin, password: e.target.value })}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-secondary">
                Login as Seller
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">
          {isAuthorized ? '🛠️ Admin Panel' : `👤 ${seller?.username}'s Panel`}
        </h1>
        <button onClick={handleLogout} className="btn btn-danger">
          🚪 Logout
        </button>
      </div>

      {/* FORM TOGGLE BUTTONS */}
      <div className="form-toggle">
        <button
          onClick={() => setFormType('account')}
          className={`toggle-btn ${formType === 'account' ? 'active' : ''}`}
        >
          <span className="toggle-icon">👤</span>
          Account Listings
        </button>
        <button
          onClick={() => setFormType('robux')}
          className={`toggle-btn ${formType === 'robux' ? 'active' : ''}`}
        >
          <span className="toggle-icon">💎</span>
          Robux Listings
        </button>
      </div>

      {/* === ACCOUNT FORM SECTION === */}
      {formType === 'account' && (
        <div className="form-section">
          <div className="form-card">
            <h3 className="form-title">Account Information</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                {[
                  ['Username', 'username', 'text'],
                  ['Total Summary', 'totalSummary', 'text'],
                  ['Price (₱)', 'price', 'number'],
                  ['Robux Balance', 'robuxBalance', 'number'],
                  ['Limited Items', 'limitedItems', 'text'],
                  ['Game with Gamepass', 'gamepass', 'text'],
                  ['Contact Link (Facebook)', 'facebookLink', 'url']
                ].map(([label, name, type]) => (
                  <div key={name} className="form-group">
                    <label className="form-label">{label}</label>
                    <input 
                      type={type} 
                      name={name} 
                      value={formData[name]} 
                      onChange={handleChange}
                      className="form-input"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Email Status</label>
                  <select name="email" value={formData.email} onChange={handleChange} className="form-select">
                    <option value="Verified">✅ Verified</option>
                    <option value="Unverified">❌ Unverified</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select name="mop" value={formData.mop} onChange={handleChange} className="form-select">
                    <option value="Gcash">💳 Gcash</option>
                    <option value="Paymaya">💳 Paymaya</option>
                    <option value="Paypal">💳 Paypal</option>
                    <option value="Others">💳 Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory</label>
                  <select name="inventory" value={formData.inventory} onChange={handleChange} className="form-select">
                    <option value="Public">🌐 Public</option>
                    <option value="Private">🔒 Private</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select name="accountType" value={formData.accountType} onChange={handleChange} className="form-select">
                    <option value="Global Account">🌍 Global</option>
                    <option value="Vietnam">🇻🇳 Vietnam</option>
                    <option value="Others">🏳️ Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Premium Status</label>
                  <select name="premium" value={formData.premium} onChange={handleChange} className="form-select">
                    <option value="True">⭐ Premium</option>
                    <option value="False">🆓 Regular</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn ${editMode ? 'btn-warning' : 'btn-primary'} full-width`}
              >
                {isSubmitting ? '⏳ Processing...' : editMode ? '✏️ Update Account' : '➕ Add Account'}
              </button>
            </form>
          </div>

          <div className="listings-section">
            <div className="section-header">
              <h3 className="section-title">Account Listings</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="🔍 Search by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="listings-grid">
              {accounts
                .filter(acc => acc.username.toLowerCase().includes(search.toLowerCase()))
                .map(acc => (
                  <div key={acc.id} className="listing-card">
                    <div className="listing-header">
                      <h4 className="listing-title">{acc.username}</h4>
                      <div className="listing-price">₱{acc.price}</div>
                    </div>
                    <div className="listing-details">
                      <div className="detail-item">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{acc.age || 'N/A'} days</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Robux:</span>
                        <span className="detail-value">{acc.robuxBalance}</span>
                      </div>
                    </div>
                    <div className="listing-actions">
                      <button 
                        onClick={() => handleEdit(acc)} 
                        className="btn btn-warning btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(acc.id)} 
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* === ROBUX FORM SECTION === */}
      {formType === 'robux' && (
        <div className="form-section">
          <div className="form-card">
            <h3 className="form-title">Robux Listing Information</h3>
            <form onSubmit={handleRobuxSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Robux Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={robuxFormData.amount}
                    onChange={handleRobuxChange}
                    required
                    className="form-input"
                    placeholder="Enter robux amount"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Method</label>
                  <input
                    type="text"
                    name="via"
                    value={robuxFormData.via}
                    onChange={handleRobuxChange}
                    required
                    className="form-input"
                    placeholder="e.g., Group Payout"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₱)</label>
                  <input
                    type="number"
                    name="price"
                    value={robuxFormData.price}
                    onChange={handleRobuxChange}
                    required
                    step="any"
                    min="0"
                    className="form-input"
                    placeholder="Enter price"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Link</label>
                  <input
                    type="url"
                    name="contact"
                    value={robuxFormData.contact}
                    onChange={handleRobuxChange}
                    required
                    className="form-input"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRobuxSubmitting}
                className={`btn ${robuxEditMode ? 'btn-warning' : 'btn-primary'} full-width`}
              >
                {isRobuxSubmitting ? '⏳ Processing...' : robuxEditMode ? '✏️ Update Robux Listing' : '➕ Add Robux Listing'}
              </button>
            </form>
          </div>

          <div className="listings-section">
            <h3 className="section-title">Robux Listings</h3>
            {robuxListings.length === 0 ? (
              <div className="empty-state">
                <p>No robux listings found.</p>
              </div>
            ) : (
              <div className="listings-grid">
                {robuxListings.map(listing => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-header">
                      <h4 className="listing-title">💎 {listing.amount} Robux</h4>
                      <div className="listing-price">₱{listing.price}</div>
                    </div>
                    <div className="listing-details">
                      <div className="detail-item">
                        <span className="detail-label">Via:</span>
                        <span className="detail-value">{listing.via}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Seller:</span>
                        <span className="detail-value">{listing.seller}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contact:</span>
                        <a href={listing.contact} target="_blank" rel="noopener noreferrer" className="contact-link">
                          View Contact
                        </a>
                      </div>
                    </div>
                    <div className="listing-actions">
                      <button
                        onClick={() => handleRobuxEdit(listing)}
                        className="btn btn-warning btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleRobuxDelete(listing.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

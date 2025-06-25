import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [seller, setSeller] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ username: '', password: '' });


// 🔽 Limited Listing States
const [limitedForm, setLimitedForm] = useState({
  assetId: "",
  name: "",
  creator: "",
  price: 0,
  pricePHP: 0,
  type: "",
  isLimited: false,
  isLimitedUnique: false,
  thumbnail: "",
  contact: "",
  seller: ""
});

const handleLimitedFetch = async () => {
  try {
    const res = await fetch(`https://economy.roproxy.com/v2/assets/${limitedForm.assetId}/details`);
    const data = await res.json();

    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${limitedForm.assetId}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const imageUrl = thumbData.data[0]?.imageUrl;

    const resalePrice = data.CollectiblesItemDetails?.CollectibleLowestResalePrice || data.PriceInRobux || 0;
    const pricePHP = resalePrice * 0.15;

    const assetTypeMap = {
      8: "Hat", 11: "Shirt", 12: "Pants", 18: "Face", 19: "Gear",
      32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
      43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
      46: "Back Accessory", 47: "Waist Accessory"
    };

    setLimitedForm(prev => ({
      ...prev,
      name: data.Name,
      creator: data.Creator?.Name || "Unknown",
      price: resalePrice,
      pricePHP: Math.round(pricePHP),
      type: assetTypeMap[data.AssetTypeId] || "Unknown",
      isLimited: data.IsLimited,
      isLimitedUnique: data.IsLimitedUnique,
      thumbnail: imageUrl
    }));
  } catch (err) {
    console.error(err);
    alert("Failed to fetch item from Asset ID");
  }
};

const handleLimitedSubmit = async () => {
  const res = await fetch("/api/limited", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(limitedForm)
  });

  const result = await res.json();
  if (result.success) {
    alert("✅ Limited item listed!");
    setLimitedForm({
      assetId: "", name: "", creator: "", price: 0, pricePHP: 0,
      type: "", isLimited: false, isLimitedUnique: false,
      thumbnail: "", contact: "", seller: ""
    });
  } else {
    alert("❌ Failed to save.");
  }
};



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
  
  const [formView, setFormView] = useState("account"); // 'account', 'robux', 'limited'

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
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => setFormView("account")} style={{ marginRight: "10px", padding: "10px", backgroundColor: formView === "account" ? "#7DC387" : "#ccc" }}>Account Listing Form</button>
        <button onClick={() => setFormView("robux")} style={{ marginRight: "10px", padding: "10px", backgroundColor: formView === "robux" ? "#7DC387" : "#ccc" }}>Robux Listing Form</button>
        <button onClick={() => setFormView("limited")} style={{ padding: "10px", backgroundColor: formView === "limited" ? "#7DC387" : "#ccc" }}>Limited Item Listing Form</button>
      </div>

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
}return (
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
      </div>

      {/* === ACCOUNT FORM SECTION === */}
      {formType === 'account' && (
        <>
          <form onSubmit={handleSubmit}>
            {[
              ['Username', 'username'],
              ['Total Summary', 'totalSummary'],
              ['Price', 'price'],
              ['Robux Balance', 'robuxBalance'],
              ['Limited Items', 'limitedItems'],
              ['Game with Gamepass', 'gamepass'],
            ].map(([label, name]) => (
              <div key={name} style={{ marginBottom: '10px' }}>
                <label style={{ color: 'white' }}>{label}:</label>
                <input type="text" name={name} value={formData[name]} onChange={handleChange} />
              </div>
            ))}

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link -FB-:</label>
              <input type="text" name="facebookLink" value={formData.facebookLink} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Email:</label>
              <select name="email" value={formData.email} onChange={handleChange}>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>MOP:</label>
              <select name="mop" value={formData.mop} onChange={handleChange}>
                <option value="Gcash">Gcash</option>
                <option value="Paymaya">Paymaya</option>
                <option value="Paypal">Paypal</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Inventory:</label>
              <select name="inventory" value={formData.inventory} onChange={handleChange}>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Account Type:</label>
              <select name="accountType" value={formData.accountType} onChange={handleChange}>
                <option value="Global Account">GLOBAL</option>
                <option value="Vietnam">VIETNAM</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Premium Status:</label>
              <select name="premium" value={formData.premium} onChange={handleChange}>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#FF0000',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isSubmitting ? 'Processing...' : editMode ? 'Update Account' : 'Add Account'}
            </button>
          </form>

          <hr style={{ margin: '30px 0' }} />
          <h3 style={{ color: 'white' }}>Account List</h3>
          <input
            type="text"
            placeholder="Search Username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          {accounts
            .filter(acc => acc.username.toLowerCase().includes(search.toLowerCase()))
            .map(acc => (
              <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', color: 'white' }}>
                <strong>{acc.username}</strong> - ₱{acc.price}
                <div>Account Age: {acc.age || 'N/A'} days</div>
                <div style={{ marginTop: '5px' }}>
                  <button onClick={() => handleEdit(acc)} style={{ background: 'orange', color: 'white', marginRight: '10px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(acc.id)} style={{ background: 'red', color: 'white' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </>
      )}

      {/* === ROBUX FORM SECTION === */}
      {formType === 'robux' && (
        <>
          <form onSubmit={handleRobuxSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Robux Amount:</label>
              <input
                type="number"
                name="amount"
                value={robuxFormData.amount}
                onChange={handleRobuxChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Method (e.g., Group Payout):</label>
              <input
                type="text"
                name="via"
                value={robuxFormData.via}
                onChange={handleRobuxChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Price (₱):</label>
              <input
                type="number"
                name="price"
                value={robuxFormData.price}
                onChange={handleRobuxChange}
                required
                step="any"
                min="0"
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link (Facebook, etc.):</label>
              <input
                type="url"
                name="contact"
                value={robuxFormData.contact}
                onChange={handleRobuxChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isRobuxSubmitting}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isRobuxSubmitting ? 'Processing...' : robuxEditMode ? 'Update Robux Listing' : 'Add Robux Listing'}
            </button>
          </form>

          <h3 style={{ color: 'white' }}>Robux Listings</h3>
          {robuxListings.length === 0 && (
            <p style={{ color: 'gray' }}>No robux listings found.</p>
          )}

          {robuxListings.map(listing => (
            <div key={listing.id} style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              color: 'white'
            }}>
              <strong>Robux:</strong> {listing.amount} <br />
              <strong>Via:</strong> {listing.via} <br />
              <strong>Price:</strong> ₱{listing.price} <br />
              <strong>Contact:</strong> <a href={listing.contact} target="_blank" rel="noopener noreferrer" style={{ color: '#00c3ff' }}>{listing.contact}</a> <br />
              <strong>Seller:</strong> {listing.seller}
              <div style={{ marginTop: '5px' }}>
                <button
                  onClick={() => handleRobuxEdit(listing)}
                  style={{ background: 'orange', color: 'white', marginRight: '10px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRobuxDelete(listing.id)}
                  style={{ background: 'red', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    
      {/* 🔽 Limited Item Listing Form */}
      <div style={{ border: "2px dashed #ccc", padding: "15px", marginTop: "30px" }}>
        </div>)}
{formView === "limited" && (<div><h2>Limited Item Listing Form</h2>
        <input type="text" placeholder="Asset ID" value={limitedForm.assetId} onChange={(e) => setLimitedForm({ ...limitedForm, assetId: e.target.value })} />
        <button onClick={handleLimitedFetch}>Fetch Info</button>

        {limitedForm.name && (
          <div style={{ marginTop: "15px" }}>
            <img src={limitedForm.thumbnail} alt={limitedForm.name} width="150" />
            <p><strong>Name:</strong> {limitedForm.name}</p>
            <p><strong>Creator:</strong> {limitedForm.creator}</p>
            <p><strong>Lowest Resale:</strong> {limitedForm.price.toLocaleString()} Robux</p>
            <p><strong>PHP:</strong> ₱{limitedForm.pricePHP.toLocaleString()}</p>
            <p><strong>Type:</strong> {limitedForm.type}</p>
            <p><strong>Is Limited:</strong> {limitedForm.isLimited ? "✅ True" : "❌ False"}</p>
            <p><strong>Is Limited Unique:</strong> {limitedForm.isLimitedUnique ? "✅ True" : "❌ False"}</p>
            <input type="text" placeholder="Contact Link" value={limitedForm.contact} onChange={(e) => setLimitedForm({ ...limitedForm, contact: e.target.value })} />
            <input type="text" placeholder="Seller Name" value={limitedForm.seller} onChange={(e) => setLimitedForm({ ...limitedForm, seller: e.target.value })} />
            <button onClick={handleLimitedSubmit}>List Item</button>
            <button style={{ marginLeft: '10px', backgroundColor: '#FFA500' }}>Edit</button>
            <button style={{ marginLeft: '10px', backgroundColor: '#FF4D4D' }}>Delete</button>
          </div>
        )}
      </div>

</div>
  );
                }

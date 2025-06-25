import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [seller, setSeller] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ username: '', password: '' });
  const [formType, setFormType] = useState('account');

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

  // === LIMITED ITEM LISTING ===
  const [limitedFormData, setLimitedFormData] = useState({
    assetId: '',
    contact: '',
    price: '',
  });
  const [limitedData, setLimitedData] = useState(null);
  const [limitedListings, setLimitedListings] = useState([]);

  const isSeller = !!seller;

  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  useEffect(() => {
    if (isAuthorized || isSeller) {
      fetchAccounts();
      fetchRobuxListings();
      fetchLimitedListings();
    }
  }, [isAuthorized, seller]);

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

  const fetchLimitedListings = async () => {
    try {
      const res = await fetch('/api/limited');
      const data = await res.json();
      if (res.ok) {
        if (isSeller) {
          const username = seller?.username;
          setLimitedListings(data.limitedList.filter(item => item.seller === username));
        } else {
          setLimitedListings(data.limitedList);
        }
      }
    } catch (error) {
      console.error('Failed to fetch limited listings:', error);
    }
  };

  const getAssetTypeName = (typeId) => {
    const types = {
      1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
      18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
      43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
      46: "Back Accessory", 47: "Waist Accessory"
    };
    return types[typeId] || "Unknown";
  };

  const fetchLimitedItemDetails = async () => {
    const assetId = limitedFormData.assetId;
    if (!assetId) return Swal.fire('Missing Field', 'Please enter an Asset ID.', 'warning');
    try {
      const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
      const details = await detailsRes.json();
      const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
      const thumbData = await thumbRes.json();
      const thumbnail = thumbData.data[0]?.imageUrl || "";
      const resale = details.CollectiblesItemDetails?.CollectibleLowestResalePrice || null;

      setLimitedData({
        name: details.Name,
        creator: details.Creator?.Name || "N/A",
        type: getAssetTypeName(details.AssetTypeId),
        isLimited: details.IsLimited,
        isLimitedUnique: details.IsLimitedUnique,
        originalPrice: resale ? `${resale.toLocaleString()} Robux` : "Offsale",
        priceInPHP: resale ? `₱${(resale * 0.15).toLocaleString()}` : "N/A",
        thumbnail
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch item. Make sure the Asset ID is valid.', 'error');
    }
  };const handleLimitedChange = (e) => {
    const { name, value } = e.target;
    setLimitedFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLimitedSubmit = async (e) => {
    e.preventDefault();
    const { assetId, contact, price } = limitedFormData;
    if (!assetId || !contact || !price) {
      return Swal.fire('Missing Fields', 'Please fill out all fields.', 'warning');
    }
    const payload = {
      assetId,
      contact,
      price,
      seller: seller?.username || 'admin'
    };
    try {
      const res = await fetch('/api/limited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        Swal.fire('Success', 'Limited item listed!', 'success');
        setLimitedFormData({ assetId: '', contact: '', price: '' });
        setLimitedData(null);
        fetchLimitedListings();
      } else {
        Swal.fire('Error', 'Failed to save limited listing.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An unexpected error occurred.', 'error');
    }
  };

  const handleLimitedDelete = async (id) => {
    if (!window.confirm('Delete this limited listing?')) return;
    try {
      const res = await fetch('/api/limited', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        Swal.fire('Deleted', 'Limited listing deleted.', 'success');
        fetchLimitedListings();
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to delete limited listing.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthorized(false);
    setAccounts([]);
    setRobuxListings([]);
    setLimitedListings([]);
    Swal.fire('Logged out', 'You have been logged out.', 'success');
  };

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
  }

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
      </h2>{/* FORM TOGGLE BUTTONS */}
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
            padding: '10px 25px',
            backgroundColor: formType === 'robux' ? '#2196F3' : '#e0e0e0',
            color: formType === 'robux' ? 'white' : 'black',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          ROBUX LISTING FORM
        </button>
        <button
          onClick={() => setFormType('limited')}
          style={{
            padding: '10px 25px',
            backgroundColor: formType === 'limited' ? '#9C27B0' : '#e0e0e0',
            color: formType === 'limited' ? 'white' : 'black',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          LIMITED ITEM LISTING FORM
        </button>
      </div>{/* === LIMITED ITEM FORM SECTION === */}
      {formType === 'limited' && (
        <>
          <form onSubmit={handleLimitedSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Asset ID:</label>
              <input
                type="text"
                id="assetIdInput"
                name="assetId"
                value={limitedFormData.assetId}
                onChange={handleLimitedChange}
                required
              />
              <button
                type="button"
                onClick={handleFetchLimitedData}
                style={{
                  marginLeft: '10px',
                  padding: '6px 12px',
                  backgroundColor: '#673AB7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Fetch
              </button>
            </div>

            <div id="result" style={{ marginBottom: '20px', color: 'white' }}>
              {limitedPreview && (
                <div>
                  <h3>{limitedPreview.name}</h3>
                  <img src={limitedPreview.thumbnail} alt="Item" style={{ width: '200px' }} />
                  <p><strong>Creator:</strong> {limitedPreview.creator}</p>
                  <p><strong>Type:</strong> {limitedPreview.type}</p>
                  <p><strong>Original Price:</strong> {limitedPreview.resale}</p>
                  <p><strong>Value (PHP):</strong> {limitedPreview.resalePHP}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link:</label>
              <input
                type="text"
                name="contact"
                value={limitedFormData.contact}
                onChange={handleLimitedChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Seller Name:</label>
              <input
                type="text"
                name="seller"
                value={limitedFormData.seller}
                readOnly
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Poison Status:</label>
              <select
                name="status"
                value={limitedFormData.status}
                onChange={handleLimitedChange}
              >
                <option value="Safe">Safe</option>
                <option value="Poison">Poison</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Selling Price (₱):</label>
              <input
                type="number"
                name="price"
                value={limitedFormData.price}
                onChange={handleLimitedChange}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#9C27B0',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px'
              }}
              disabled={limitedSubmitting}
            >
              {limitedSubmitting ? 'Submitting...' : 'Add Limited Listing'}
            </button>
          </form>
        </>
      )}// 🟣 Limited Item Listing State
const [limitedFormData, setLimitedFormData] = useState({
  assetId: '',
  contact: '',
  status: 'Safe',
  price: '',
  seller: seller?.username || '',
});

const [limitedSubmitting, setLimitedSubmitting] = useState(false);
const [limitedPreview, setLimitedPreview] = useState(null);
const [limitedListings, setLimitedListings] = useState([]);

// Fetch limited listings
useEffect(() => {
  if (isAuthorized || isSeller) fetchLimitedListings();
}, [isAuthorized, seller]);

const fetchLimitedListings = async () => {
  try {
    const res = await fetch('/api/limited');
    const data = await res.json();
    if (res.ok) {
      const filtered = isSeller
        ? data.limitedList.filter(item => item.seller === seller?.username)
        : data.limitedList;
      setLimitedListings(filtered);
    }
  } catch (error) {
    console.error('Failed to fetch limited items:', error);
  }
};

// Handle form input change
const handleLimitedChange = (e) => {
  const { name, value } = e.target;
  setLimitedFormData(prev => ({ ...prev, [name]: value }));
};

// Fetch preview info from assetId
const handleFetchLimitedData = async () => {
  const assetId = limitedFormData.assetId.trim();
  if (!assetId) return Swal.fire('Error', 'Please enter Asset ID', 'warning');

  setLimitedPreview(null);

  try {
    const [detailsRes, thumbRes] = await Promise.all([
      fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`),
      fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`)
    ]);
    const details = await detailsRes.json();
    const thumbData = await thumbRes.json();

    const resale = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
    const resalePHP = resale ? `₱${(resale * 0.15).toLocaleString()}` : 'N/A';
    const resaleFormatted = resale ? `${resale.toLocaleString()} Robux` : 'Offsale';

    const getAssetTypeName = (typeId) => {
      const types = {
        1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
        18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
        43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
        46: "Back Accessory", 47: "Waist Accessory"
      };
      return types[typeId] || "Unknown";
    };

    setLimitedPreview({
      name: details.Name,
      creator: details.Creator?.Name || 'N/A',
      type: getAssetTypeName(details.AssetTypeId),
      resale: resaleFormatted,
      resalePHP,
      thumbnail: thumbData.data?.[0]?.imageUrl || ''
    });

  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Failed to fetch limited item details.', 'error');
  }
};

// Submit limited item
const handleLimitedSubmit = async (e) => {
  e.preventDefault();
  setLimitedSubmitting(true);

  const payload = {
    ...limitedFormData,
    ...limitedPreview,
    seller: seller?.username || 'admin'
  };

  try {
    const res = await fetch('/api/limited', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      Swal.fire('Success', 'Limited listing added!', 'success');
      setLimitedFormData({
        assetId: '',
        contact: '',
        status: 'Safe',
        price: '',
        seller: seller?.username || ''
      });
      setLimitedPreview(null);
      fetchLimitedListings();
    } else {
      Swal.fire('Error', 'Failed to submit listing.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Unexpected error occurred.', 'error');
  } finally {
    setLimitedSubmitting(false);
  }
};

// Render Limited Listings
{formType === 'limited' && (
  <>
    <hr style={{ margin: '30px 0' }} />
    <h3 style={{ color: 'white' }}>Limited Item Listings</h3>
    {limitedListings.length === 0 && (
      <p style={{ color: 'gray' }}>No limited items listed.</p>
    )}

    {limitedListings.map(item => (
      <div key={item.assetId} style={{
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '10px',
        color: 'white'
      }}>
        <strong>{item.name}</strong><br />
        <img src={item.thumbnail} alt={item.name} style={{ width: '100px' }} /><br />
        <strong>Creator:</strong> {item.creator} <br />
        <strong>Type:</strong> {item.type} <br />
        <strong>Original Price:</strong> {item.resale} <br />
        <strong>Value (PHP):</strong> {item.resalePHP} <br />
        <strong>Contact:</strong> <a href={item.contact} target="_blank" rel="noopener noreferrer" style={{ color: '#00c3ff' }}>{item.contact}</a> <br />
        <strong>Status:</strong> {item.status} <br />
        <strong>Selling Price:</strong> ₱{item.price} <br />
        <strong>Seller:</strong> {item.seller}
      </div>
    ))}
  </>
)}

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

  // Limited Item state
  const [limitedListings, setLimitedListings] = useState([]);
  const [limitedFormData, setLimitedFormData] = useState({
    assetId: '',
    contact: '',
    price: '',
    poison: 'Safe'
  });
  const [limitedItemPreview, setLimitedItemPreview] = useState(null);
  const [isLimitedSubmitting, setIsLimitedSubmitting] = useState(false);
  const [limitedEditMode, setLimitedEditMode] = useState(false);
  const [limitedEditId, setLimitedEditId] = useState(null);

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
      const res = await fetch('/api/limiteds');
      const data = await res.json();
      if (res.ok) {
        if (isSeller) {
          const username = seller?.username;
          setLimitedListings(data.limiteds.filter(item => item.seller === username));
        } else {
          setLimitedListings(data.limiteds);
        }
      }
    } catch (err) {
      console.error('Failed to fetch limited items:', err);
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

  const fetchLimitedItemPreview = async () => {
    const assetId = limitedFormData.assetId.trim();
    if (!assetId) return Swal.fire('Missing', 'Please enter an Asset ID.', 'warning');

    try {
      const [detailsRes, thumbRes] = await Promise.all([
        fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`),
        fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`)
      ]);

      const details = await detailsRes.json();
      const thumbData = await thumbRes.json();
      const thumbnail = thumbData?.data?.[0]?.imageUrl || "";

      const resalePrice = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
      const formattedResale = resalePrice ? `${resalePrice.toLocaleString()} Robux` : "Offsale";
      const resaleInPHP = resalePrice ? `₱${(resalePrice * 0.15).toLocaleString()}` : "N/A";

      setLimitedItemPreview({
        name: details.Name,
        creator: details.Creator?.Name || "N/A",
        thumbnail,
        resale: formattedResale,
        resalePHP: resaleInPHP,
        type: getAssetTypeName(details.AssetTypeId),
        isLimited: details.IsLimited,
        isLimitedUnique: details.IsLimitedUnique
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Failed', 'Could not fetch item details. Make sure the Asset ID is valid.', 'error');
    }
  };const handleLimitedInputChange = (e) => {
    const { name, value } = e.target;
    setLimitedFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLimitedSubmit = async (e) => {
    e.preventDefault();
    if (isLimitedSubmitting) return;
    setIsLimitedSubmitting(true);

    const { assetId, contact, price, poison } = limitedFormData;

    if (!assetId || !contact || !price) {
      Swal.fire('Missing Fields', 'Please fill all required fields.', 'warning');
      setIsLimitedSubmitting(false);
      return;
    }

    const payload = {
      ...(limitedEditMode ? { id: limitedEditId } : {}),
      assetId,
      contact,
      price,
      poison,
      seller: seller?.username || 'admin'
    };

    try {
      const method = limitedEditMode ? 'PUT' : 'POST';
      const res = await fetch('/api/limiteds', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('Success', limitedEditMode ? 'Limited listing updated!' : 'Limited item listed!', 'success');
        setLimitedFormData({ assetId: '', contact: '', price: '', poison: 'Safe' });
        setLimitedItemPreview(null);
        setLimitedEditMode(false);
        setLimitedEditId(null);
        fetchLimitedListings();
      } else {
        Swal.fire('Error', 'Failed to save limited item listing.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Unexpected error occurred.', 'error');
    } finally {
      setIsLimitedSubmitting(false);
    }
  };

  const handleLimitedDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Limited Item?')) return;

    try {
      const res = await fetch('/api/limiteds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        Swal.fire('Deleted', 'Limited item deleted.', 'success');
        fetchLimitedListings();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete limited item.', 'error');
    }
  };

  const handleLimitedEdit = (item) => {
    setLimitedFormData({
      assetId: item.assetId || '',
      contact: item.contact || '',
      price: item.price || '',
      poison: item.poison || 'Safe'
    });
    setLimitedEditMode(true);
    setLimitedEditId(item.id);
  };

  // === UI RENDER ===
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
      </h2>

      {/* FORM TOGGLE BUTTONS */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
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
      </div>{/* === LIMITED ITEM LISTING FORM === */}
      {formType === 'limited' && (
        <>
          <form onSubmit={handleLimitedSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Asset ID:</label>
              <input
                type="text"
                name="assetId"
                value={limitedFormData.assetId}
                onChange={handleLimitedInputChange}
                required
              />
              <button
                type="button"
                onClick={fetchLimitedItemPreview}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#00c3ff',
                  border: 'none',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Fetch Item
              </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Contact Link:</label>
              <input
                type="text"
                name="contact"
                value={limitedFormData.contact}
                onChange={handleLimitedInputChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Price (₱):</label>
              <input
                type="number"
                name="price"
                value={limitedFormData.price}
                onChange={handleLimitedInputChange}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white' }}>Poison Status:</label>
              <select
                name="poison"
                value={limitedFormData.poison}
                onChange={handleLimitedInputChange}
              >
                <option value="Safe">Safe</option>
                <option value="Poisoned">Poisoned</option>
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
              {isLimitedSubmitting
                ? 'Processing...'
                : limitedEditMode
                ? 'Update Limited Listing'
                : 'Add Limited Item'}
            </button>
          </form>

          {/* Preview Box */}
          {limitedItemPreview && (
            <div style={{
              backgroundColor: '#2c2c2c',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h3>{limitedItemPreview.name}</h3>
              <img src={limitedItemPreview.image} alt="Preview" width="150" />
              <p><strong>Creator:</strong> {limitedItemPreview.creator}</p>
              <p><strong>Original Price:</strong> {limitedItemPreview.originalPrice}</p>
              <p><strong>Type:</strong> {limitedItemPreview.type}</p>
              <p><strong>Is Limited:</strong> {limitedItemPreview.isLimited}</p>
              <p><strong>Is Limited Unique:</strong> {limitedItemPreview.isUnique}</p>
            </div>
          )}

          <h3 style={{ color: 'white', marginTop: '30px' }}>Limited Item Listings</h3>
          {limitedListings.length === 0 && (
            <p style={{ color: 'gray' }}>No limited items listed yet.</p>
          )}
          {limitedListings.map(item => (
            <div key={item.id} style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              color: 'white'
            }}>
              <strong>Asset ID:</strong> {item.assetId}<br />
              <strong>Contact:</strong> <a href={item.contact} target="_blank" rel="noreferrer" style={{ color: '#00c3ff' }}>{item.contact}</a><br />
              <strong>Price (₱):</strong> {item.price}<br />
              <strong>Poison Status:</strong> {item.poison}<br />
              <strong>Seller:</strong> {item.seller}
              <div style={{ marginTop: '5px' }}>
                <button
                  onClick={() => handleLimitedEdit(item)}
                  style={{ background: 'orange', color: 'white', marginRight: '10px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleLimitedDelete(item.id)}
                  style={{ background: 'red', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}// === Limited Helper Functions ===

// Convert AssetTypeId to readable type
function getAssetTypeName(typeId) {
  const types = {
    1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
    18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
    43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
    46: "Back Accessory", 47: "Waist Accessory"
  };
  return types[typeId] || "Unknown";
}

// Fetch Limited Item preview from assetId
const fetchLimitedItemPreview = async () => {
  const assetId = limitedFormData.assetId;
  if (!assetId) {
    Swal.fire('Missing Field', 'Please enter an Asset ID first.', 'warning');
    return;
  }

  setLimitedItemPreview(null);
  try {
    const detailRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
    const detail = await detailRes.json();

    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
    const thumb = await thumbRes.json();
    const image = thumb?.data?.[0]?.imageUrl || '';

    const resale = detail.CollectiblesItemDetails?.CollectibleLowestResalePrice;
    const resaleRobux = resale ? `${resale.toLocaleString()} Robux` : 'Offsale';
    const resalePHP = resale ? `₱${(resale * 0.15).toLocaleString()}` : 'N/A';

    setLimitedItemPreview({
      name: detail.Name,
      creator: detail.Creator?.Name || 'N/A',
      originalPrice: resaleRobux + ' / ' + resalePHP,
      type: getAssetTypeName(detail.AssetTypeId),
      isLimited: detail.IsLimited ? '✅ True' : '❌ False',
      isUnique: detail.IsLimitedUnique ? '✅ True' : '❌ False',
      image
    });

    // Auto-assign seller name if logged in
    if (seller?.username) {
      setLimitedFormData(prev => ({ ...prev, seller: seller.username }));
    }

  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Failed to fetch asset data. Ensure the Asset ID is correct.', 'error');
  }
};// === Limited Item Submit ===
const handleLimitedSubmit = async (e) => {
  e.preventDefault();
  if (isLimitedSubmitting) return;
  setIsLimitedSubmitting(true);

  const { assetId, contact, price, seller } = limitedFormData;

  if (!assetId || !contact || !price) {
    Swal.fire('Missing Fields', 'Please fill out all required fields.', 'warning');
    setIsLimitedSubmitting(false);
    return;
  }

  const payload = {
    ...(limitedEditMode ? { id: limitedEditId } : {}),
    assetId,
    contact,
    price,
    seller: seller || (isSeller ? seller?.username : 'admin')
  };

  try {
    const res = await fetch('/api/limited', {
      method: limitedEditMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      Swal.fire('Success', limitedEditMode ? 'Limited listing updated!' : 'Limited listing added!', 'success');
      setLimitedFormData({ assetId: '', contact: '', price: '', seller: '' });
      setLimitedItemPreview(null);
      setLimitedEditMode(false);
      setLimitedEditId(null);
      fetchLimitedListings();
    } else {
      Swal.fire('Error', 'Failed to save limited listing.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'An unexpected error occurred.', 'error');
  } finally {
    setIsLimitedSubmitting(false);
  }
};

// === Limited Delete ===
const handleLimitedDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this listing?')) return;

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
    Swal.fire('Error', 'Failed to delete listing.', 'error');
  }
};

// === Limited Edit ===
const handleLimitedEdit = (listing) => {
  setLimitedFormData({
    assetId: listing.assetId || '',
    contact: listing.contact || '',
    price: listing.price || '',
    seller: listing.seller || ''
  });
  setLimitedEditMode(true);
  setLimitedEditId(listing.id);
  fetchLimitedItemPreview(); // Optional: show auto-fetch again on edit
};

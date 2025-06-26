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

  // Limited listing state
  const [limitedListings, setLimitedListings] = useState([]);
  const [limitedItem, setLimitedItem] = useState(null);
  const [contactLink, setContactLink] = useState('');

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
    const assetId = document.getElementById("assetIdInput").value;
    if (!assetId) return Swal.fire('Missing Field', 'Please enter an Asset ID', 'warning');

    try {
      const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
      const details = await detailsRes.json();

      const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
      const thumbData = await thumbRes.json();
      const thumbnail = thumbData.data[0]?.imageUrl || "";

      const resalePrice = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
      const resaleFormatted = resalePrice ? `${resalePrice.toLocaleString()} Robux` : "Offsale";
      const resalePHP = resalePrice ? `₱${(resalePrice * 0.15).toLocaleString()}` : "N/A";

      const item = {
        assetId,
        name: details.Name,
        image: thumbnail,
        creator: details.Creator?.Name || "N/A",
        type: getAssetTypeName(details.AssetTypeId),
        resalePrice: resaleFormatted,
        resalePricePHP: resalePHP,
        isLimited: details.IsLimited || false,
        isLimitedUnique: details.IsLimitedUnique || false
      };

      setLimitedItem(item);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to fetch item. Make sure the Asset ID is valid.', 'error');
    }
  };const handleSaveLimitedItem = async () => {
    if (!limitedItem || !contactLink) {
      return Swal.fire('Missing Fields', 'Please fetch item and enter contact link.', 'warning');
    }

    try {
      const res = await fetch('/api/limited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...limitedItem,
          contact: contactLink,
          seller: seller?.username || 'admin'
        })
      });

      if (res.ok) {
        Swal.fire('Success', 'Limited item listing saved!', 'success');
        setLimitedItem(null);
        setContactLink('');
        fetchLimitedListings();
      } else {
        Swal.fire('Error', 'Failed to save limited item listing.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Something went wrong while saving.', 'error');
    }
  };

  const handleDeleteLimited = async (id) => {
    if (!window.confirm('Delete this limited item listing?')) return;

    try {
      const res = await fetch('/api/limited', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        Swal.fire('Deleted!', 'Listing removed.', 'success');
        fetchLimitedListings();
      } else {
        Swal.fire('Error', 'Failed to delete listing.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Unexpected error deleting listing.', 'error');
    }
  };

  // UI RETURN STARTS
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

      {/* FORM NAVIGATION BUTTONS */}
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
            backgroundColor: formType === 'limited' ? '#FFC107' : '#e0e0e0',
            color: formType === 'limited' ? 'black' : 'black',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          LIMITED LISTING FORM
        </button>
      </div>

      {/* === LIMITED ITEM FORM SECTION === */}
      {formType === 'limited' && (
        <div style={{ color: 'white', marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '15px' }}>Fetch Limited Item by Asset ID</h3>
          <input
            type="text"
            id="assetIdInput"
            placeholder="Enter Asset ID"
            style={{ marginRight: '10px' }}
          />
          <button
            onClick={fetchLimitedItemDetails}
            style={{
              padding: '5px 15px',
              backgroundColor: '#FFC107',
              border: 'none',
              color: 'black',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Fetch
          </button>

          {limitedItem && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: '1px solid #ccc',
              borderRadius: '10px',
              backgroundColor: '#1c1c1c'
            }}>
              <h3>{limitedItem.name}</h3>
              <img src={limitedItem.image} alt="Item" style={{ maxWidth: '200px', borderRadius: '10px' }} />
              <p><strong>Creator:</strong> {limitedItem.creator}</p>
              <p><strong>Type:</strong> {limitedItem.type}</p>
              <p><strong>Lowest Resale Price:</strong> {limitedItem.resalePrice}</p>
              <p><strong>BM 150PHP/1000RBX:</strong> {limitedItem.resalePricePHP}</p>
              <p><strong>Is Limited:</strong> {limitedItem.isLimited ? '✅ True' : '❌ False'}</p>
              <p><strong>Is Limited Unique:</strong> {limitedItem.isLimitedUnique ? '✅ True' : '❌ False'}</p>

              <div style={{ marginTop: '15px' }}>
                <label>Contact Link:</label>
                <input
                  type="text"
                  value={contactLink}
                  onChange={e => setContactLink(e.target.value)}
                  placeholder="Facebook, Discord etc."
                  style={{ width: '100%', marginBottom: '10px' }}
                />
              </div>

              <button
                onClick={handleSaveLimitedItem}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                Save Listing
              </button>
            </div>
          )}
        </div>
      )}{/* === DISPLAY LIMITED ITEM LISTINGS === */}
      {formType === 'limited' && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: 'white' }}>Saved Limited Listings</h3>
          {limitedListings.length === 0 && (
            <p style={{ color: 'gray' }}>No limited item listings found.</p>
          )}

          {limitedListings.map(listing => (
            <div
              key={listing.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '10px',
                backgroundColor: '#1c1c1c',
                color: 'white'
              }}
            >
              <h3>{listing.name}</h3>
              <img
                src={listing.image}
                alt={listing.name}
                style={{ maxWidth: '200px', borderRadius: '10px', marginBottom: '10px' }}
              />
              <p><strong>Creator:</strong> {listing.creator}</p>
              <p><strong>Type:</strong> {listing.type}</p>
              <p><strong>Resale Price:</strong> {listing.resalePrice}</p>
              <p><strong>Resale PHP:</strong> {listing.resalePricePHP}</p>
              <p><strong>Is Limited:</strong> {listing.isLimited ? '✅ True' : '❌ False'}</p>
              <p><strong>Is Limited Unique:</strong> {listing.isLimitedUnique ? '✅ True' : '❌ False'}</p>
              <p><strong>Contact:</strong> <a href={listing.contact} target="_blank" rel="noreferrer" style={{ color: '#00c3ff' }}>{listing.contact}</a></p>
              <p><strong>Seller:</strong> {listing.seller}</p>

              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => {
                    setLimitedItem({
                      name: listing.name,
                      creator: listing.creator,
                      type: listing.type,
                      resalePrice: listing.resalePrice,
                      resalePricePHP: listing.resalePricePHP,
                      isLimited: listing.isLimited,
                      isLimitedUnique: listing.isLimitedUnique,
                      image: listing.image
                    });
                    setContactLink(listing.contact);
                    setEditId(listing.id);
                  }}
                  style={{
                    background: 'orange',
                    color: 'white',
                    marginRight: '10px',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLimited(listing.id)}
                  style={{
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === LIMITED ITEM HELPERS ===
function getAssetTypeName(typeId) {
  const types = {
    1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
    18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
    43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
    46: "Back Accessory", 47: "Waist Accessory"
  };
  return types[typeId] || "Unknown";
}// === FETCH LIMITED ITEM DETAILS FUNCTION ===
const fetchLimitedItemDetails = async () => {
  if (!assetIdInput.trim()) {
    Swal.fire('Missing Field', 'Please enter an Asset ID.', 'warning');
    return;
  }

  setFetchingItem(true);
  try {
    const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetIdInput}/details`);
    const details = await detailsRes.json();

    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetIdInput}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const thumbnail = thumbData.data[0]?.imageUrl || '';

    const resale = details.CollectiblesItemDetails?.CollectibleLowestResalePrice || 0;

    setLimitedItem({
      name: details.Name || 'Unknown',
      creator: details.Creator?.Name || 'N/A',
      type: getAssetTypeName(details.AssetTypeId),
      resalePrice: resale ? `${resale.toLocaleString()} Robux` : 'Offsale',
      resalePricePHP: resale ? `₱${(resale * 0.15).toLocaleString()} PHP` : 'N/A',
      isLimited: details.IsLimited || false,
      isLimitedUnique: details.IsLimitedUnique || false,
      image: thumbnail
    });

    Swal.fire('Item Fetched!', 'Limited item details have been loaded.', 'success');
  } catch (error) {
    console.error(error);
    Swal.fire('Fetch Error', 'Failed to fetch item. Ensure the Asset ID is valid.', 'error');
  } finally {
    setFetchingItem(false);
  }
};

// === DELETE HANDLER FOR LIMITED ITEM ===
const handleDeleteLimited = async (id) => {
  if (!window.confirm('Are you sure you want to delete this Limited Item listing?')) return;

  try {
    const res = await fetch('/api/limited', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      Swal.fire('Deleted', 'Limited item listing deleted.', 'success');
      fetchLimitedListings();
    } else {
      Swal.fire('Error', 'Failed to delete listing.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'An unexpected error occurred.', 'error');
  }
};

// === GET SELLER USERNAME FROM LOCALSTORAGE ===
const getSellerUsername = () => {
  const data = localStorage.getItem('seller');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.username || 'admin';
    } catch {
      return 'admin';
    }
  }
  return 'admin';
};// === FETCH LIMITED LISTINGS ON LOAD ===
useEffect(() => {
  if (isAuthorized || isSeller) {
    fetchLimitedListings();
  }
}, [isAuthorized, seller]);

// === FETCH FROM API ===
const fetchLimitedListings = async () => {
  try {
    const res = await fetch('/api/limited');
    const data = await res.json();
    if (res.ok) {
      const user = seller?.username;
      setLimitedListings(isSeller ? data.limitedList.filter(i => i.seller === user) : data.limitedList);
    }
  } catch (err) {
    console.error('Fetch failed', err);
  }
};

// === SUBMIT HANDLER FOR LIMITED ITEM FORM ===
const handleLimitedSubmit = async (e) => {
  e.preventDefault();
  if (isLimitedSubmitting) return;
  setIsLimitedSubmitting(true);

  const payload = {
    assetId: assetIdInput,
    contact: limitedFormData.contact,
    seller: getSellerUsername()
  };

  try {
    const res = await fetch('/api/limited', {
      method: limitedEditMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, ...(limitedEditMode && { id: limitedEditId }) })
    });

    if (res.ok) {
      Swal.fire('Success', limitedEditMode ? 'Updated!' : 'Listing added!', 'success');
      setAssetIdInput('');
      setLimitedFormData({ contact: '' });
      setLimitedEditMode(false);
      setLimitedEditId(null);
      fetchLimitedListings();
    } else {
      Swal.fire('Error', 'Failed to save listing.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Unexpected error', 'error');
  } finally {
    setIsLimitedSubmitting(false);
  }
};

// === EDIT HANDLER FOR LIMITED ITEM ===
const handleEditLimited = (item) => {
  setAssetIdInput(item.assetId);
  setLimitedFormData({ contact: item.contact });
  setLimitedEditMode(true);
  setLimitedEditId(item.id);
};

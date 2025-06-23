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

  const isSeller = !!seller;

  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  useEffect(() => {
    if (isAuthorized || isSeller) {
      fetchAccounts();
      fetchRobuxListings();
    }
  }, [isAuthorized, seller]);

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    if (isSeller) {
      const username = JSON.parse(localStorage.getItem('seller'))?.username;
      setAccounts(data.accounts.filter(acc => acc.seller === username));
    } else {
      setAccounts(data.accounts);
    }
  };

  const fetchRobuxListings = async () => {
    try {
      const res = await fetch('/api/robux');
      const data = await res.json();
      if (res.ok) {
        const all = data.robuxList;
        if (isSeller) {
          const user = JSON.parse(localStorage.getItem('seller'))?.username;
          setRobuxListings(all.filter(x => x.seller === user));
        } else {
          setRobuxListings(all);
        }
      }
    } catch (err) {
      console.error(err);
    }
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
        <button onClick={handleLogout} style={{ marginLeft: '20px', background: 'red', color: '#fff' }}>
          Logout
        </button>
      </h2>

      {/* FORM TOGGLE BUTTONS */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setFormType('account')}
          style={{
            padding: '10px 20px',
            backgroundColor: formType === 'account' ? '#4CAF50' : '#e0e0e0',
            color: formType === 'account' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
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
      </div>{/* === ACCOUNT FORM SECTION === */}
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
                <option value="GLOBAL">GLOBAL</option>
                <option value="VIETNAM">VIETNAM</option>
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
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amount = prompt('Enter Robux Amount');
              const via = prompt('Enter Method (Group Payout, Shirt Buying, etc.)');
              const price = prompt('Enter Price (e.g. ₱150)');
              const contact = prompt('Enter Contact Link (Facebook, etc.)');

              if (!amount || !via || !price || !contact) {
                Swal.fire('Missing Fields', 'Please fill out all Robux details.', 'warning');
                return;
              }

              try {
                const res = await fetch('/api/robux', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    seller: seller.username,
                    amount,
                    via,
                    price,
                    contact,
                  }),
                });

                if (res.ok) {
                  Swal.fire('Success', 'Robux listing added!', 'success');
                  fetchRobuxListings();
                } else {
                  Swal.fire('Error', 'Failed to add Robux listing.', 'error');
                }
              } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Unexpected server error.', 'error');
              }
            }}
          >
            <button
              type="submit"
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                marginBottom: '20px',
                marginTop: '10px'
              }}
            >
              Add Robux Listing
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
                  onClick={async () => {
                    const amount = prompt('New Robux Amount', listing.amount);
                    const via = prompt('New Method', listing.via);
                    const price = prompt('New Price', listing.price);
                    const contact = prompt('New Contact', listing.contact);

                    if (!amount || !via || !price || !contact) {
                      Swal.fire('Missing Fields', 'Please fill out all fields.', 'warning');
                      return;
                    }

                    try {
                      const res = await fetch('/api/robux', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: listing.id,
                          amount,
                          via,
                          price,
                          contact,
                        }),
                      });

                      if (res.ok) {
                        Swal.fire('Updated', 'Robux listing updated!', 'success');
                        fetchRobuxListings();
                      } else {
                        Swal.fire('Error', 'Failed to update.', 'error');
                      }
                    } catch (err) {
                      console.error(err);
                      Swal.fire('Error', 'Unexpected error.', 'error');
                    }
                  }}
                  style={{ background: 'orange', color: 'white', marginRight: '10px' }}
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this robux listing?')) return;

                    try {
                      const res = await fetch('/api/robux', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: listing.id }),
                      });

                      if (res.ok) {
                        Swal.fire('Deleted', 'Robux listing removed.', 'success');
                        fetchRobuxListings();
                      } else {
                        Swal.fire('Error', 'Failed to delete.', 'error');
                      }
                    } catch (err) {
                      console.error(err);
                      Swal.fire('Error', 'Unexpected server error.', 'error');
                    }
                  }}
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
              }

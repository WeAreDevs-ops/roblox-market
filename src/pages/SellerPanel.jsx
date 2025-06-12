import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function SellerPanel() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    avatar: '',
    price: '',
    email: 'Unverified',
    negotiable: 'No',
    mop: '',
    games: '',
    robuxBalance: '',
    limitedItems: '',
    inventory: '',
    age: '13+',
    accountType: '',
    profile: '',
    contact: {
      facebook: '',
      discord: ''
    }
  });

  // TEMP: you will later replace this with real seller auth info
  const seller = {
    id: 'SELLER_ID_SAMPLE',
    name: 'Sample Seller',
    email: 'seller@example.com'
  };

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        const sellerAccounts = data.accounts.filter(acc => acc.seller?.email === seller.email);
        setAccounts(sellerAccounts);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAccount = () => {
    const newAccount = {
      ...formData,
      price: parseFloat(formData.price),
      robuxBalance: parseInt(formData.robuxBalance),
      limitedItems: parseInt(formData.limitedItems),
      inventory: parseInt(formData.inventory),
      games: formData.games.split(',').map(g => g.trim()),
      seller: {
        name: seller.name,
        email: seller.email,
      },
    };

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    })
      .then(res => res.json())
      .then(() => {
        Swal.fire('Success', 'Account added successfully', 'success');
        setAccounts(prev => [...prev, newAccount]);
      })
      .catch(() => Swal.fire('Error', 'Failed to add account', 'error'));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete?',
      text: 'Are you sure to delete this account?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/accounts/${id}`, { method: 'DELETE' })
          .then(() => {
            Swal.fire('Deleted!', '', 'success');
            setAccounts(prev => prev.filter(acc => acc.id !== id));
          })
          .catch(() => Swal.fire('Error', 'Failed to delete account', 'error'));
      }
    });
  };

  return (
    <div className="container">
      <h2>Seller Panel</h2>

      <h3>Add New Account</h3>
      <div className="form">
        <input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} /><br />
        <input name="avatar" placeholder="Avatar URL" value={formData.avatar} onChange={handleInputChange} /><br />
        <input name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} /><br />
        <select name="email" value={formData.email} onChange={handleInputChange}>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
        </select><br />
        <select name="negotiable" value={formData.negotiable} onChange={handleInputChange}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select><br />
        <input name="mop" placeholder="MOP" value={formData.mop} onChange={handleInputChange} /><br />
        <input name="games" placeholder="Games (comma separated)" value={formData.games} onChange={handleInputChange} /><br />
        <input name="robuxBalance" placeholder="Robux Balance" value={formData.robuxBalance} onChange={handleInputChange} /><br />
        <input name="limitedItems" placeholder="Limited Items" value={formData.limitedItems} onChange={handleInputChange} /><br />
        <input name="inventory" placeholder="Inventory" value={formData.inventory} onChange={handleInputChange} /><br />
        <input name="accountType" placeholder="Account Type" value={formData.accountType} onChange={handleInputChange} /><br />
        <input name="profile" placeholder="Profile URL" value={formData.profile} onChange={handleInputChange} /><br />

        <h4>Seller Contact Info</h4>
        <input name="contact.facebook" placeholder="Facebook URL" value={formData.contact.facebook} onChange={handleInputChange} /><br />
        <input name="contact.discord" placeholder="Discord Invite Code" value={formData.contact.discord} onChange={handleInputChange} /><br />

        <button onClick={handleAddAccount}>Add Account</button>
      </div>

      <h3>My Listings</h3>
      {loading ? <p>Loading...</p> :
        accounts.map(acc => (
          <div key={acc.id} style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
            <h4>{acc.username}</h4>
            <p>₱{acc.price}</p>
            <button onClick={() => handleDelete(acc.id)}>Delete</button>
          </div>
        ))
      }
    </div>
  );
        }

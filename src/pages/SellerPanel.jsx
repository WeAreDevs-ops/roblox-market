import React, { useEffect, useState } from 'react';

export default function SellerPanel() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ username: '', price: '', robux: '' });

  const fetchListings = async () => {
    const res = await fetch('/api/seller-listings');
    const data = await res.json();
    if (res.ok) {
      setListings(data.listings);
    } else {
      setMessage(data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/create-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchListings();
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="container" style={{ marginTop: 40 }}>
      <h2>📋 Seller Panel</h2>

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="price" placeholder="Price (₱)" onChange={handleChange} required />
        <input name="robux" placeholder="Robux" onChange={handleChange} required />
        <button className="buy" type="submit">Create Listing</button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}

      <h3 style={{ marginTop: 30 }}>Your Listings</h3>
      <ul>
        {listings.map((acc, idx) => (
          <li key={idx}>
            {acc.username} – ₱{acc.price} – {acc.robux} Robux
          </li>
        ))}
      </ul>
    </div>
  );
}

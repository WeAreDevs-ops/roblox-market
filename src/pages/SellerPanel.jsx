import React, { useEffect, useState } from 'react';

export default function SellerPanel() {
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({ username: '', price: 0 });

  const token = localStorage.getItem('sellerToken');

  const fetchListings = async () => {
    const res = await fetch(`/api/seller-listings?token=${token}`);
    const data = await res.json();
    setListings(data.listings);
  };

  const createListing = async () => {
    await fetch('/api/create-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, listing: newListing })
    });
    setNewListing({ username: '', price: 0 });
    fetchListings();
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Seller Panel</h2>

      <input
        placeholder="Username"
        value={newListing.username}
        onChange={(e) => setNewListing({ ...newListing, username: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newListing.price}
        onChange={(e) => setNewListing({ ...newListing, price: Number(e.target.value) })}
      />
      <button onClick={createListing}>Add Listing</button>

      <h3>Your Listings</h3>
      <ul>
        {listings.map((l) => (
          <li key={l.id}>{l.username} — ₱{l.price}</li>
        ))}
      </ul>
    </div>
  );
}

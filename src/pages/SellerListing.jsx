// src/pages/SellerListing.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const SellerListing = () => {
  const username = localStorage.getItem('sellerUsername');
  const [form, setForm] = useState({ title: '', price: '' });
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get('/api/seller-listings', { params: { username } });
      setListings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/create-listing', { ...form, username });
      Swal.fire('Success', 'Listing added!', 'success');
      setForm({ title: '', price: '' });
      fetchListings();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to add listing.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.post('/api/delete-listing', { id });
      fetchListings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id) => {
    const newTitle = prompt('New title:', '');
    const newPrice = prompt('New price:', '');
    if (!newTitle || !newPrice) return;

    try {
      await axios.post('/api/update-listing', { id, title: newTitle, price: newPrice });
      fetchListings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>My Listings</h2>

      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <button onClick={handleAdd}>Add Listing</button>

      <hr />

      {listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        listings.map((item, idx) => (
          <div className="card" key={idx}>
            <h3>{item.title}</h3>
            <p><b>Price:</b> {item.price}</p>
            <div className="buttons">
              <button onClick={() => handleUpdate(item.id)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerListing;

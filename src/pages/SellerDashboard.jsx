// src/pages/SellerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('/api/seller-listings')
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Seller Listings</h2>
      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        listings.map((item, idx) => (
          <div className="card" key={idx}>
            <h3>{item.title}</h3>
            <p><b>Price:</b> {item.price}</p>
            <p><b>Seller:</b> {item.username}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerDashboard;

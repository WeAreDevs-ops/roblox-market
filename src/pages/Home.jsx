import React, { useState, useEffect } from 'react';

export default function Home() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  const handleBuy = () => {
    alert('Contact me on Discord: yourdiscord OR Facebook: yourfacebook');
  };

  return (
    <div className="container">
      <h1>Roblox Marketplace</h1>
      <div className="cards">
        {accounts.map(acc => (
          <div key={acc.id} className="card">
            <img src={acc.imageUrl} alt="Account" />
            <h3>{acc.username}</h3>
            <p>Age: {acc.age}</p>
            <p>Email: {acc.email}</p>
            <a href={acc.profileLink} target="_blank">Visit Profile</a>
            <button onClick={handleBuy}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

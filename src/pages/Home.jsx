import React, { useEffect, useState } from 'react';

export default function Home() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  return (
    <div className="container">
      <h1>Roblox Marketplace</h1>
      {accounts.map(acc => (
        <div key={acc.id} className="account-card">
          <img src={acc.imageUrl} alt="Avatar" />
          <div className="account-info">
            <h3>{acc.username}</h3>
            <p>Age: {acc.age}</p>
            <p>Email: {acc.email}</p>
            <a href={acc.profileLink} target="_blank" rel="noreferrer">
              View Profile
            </a>
            <button onClick={() => alert("Contact me via Facebook: yourfb.com or Discord: yourdiscord")}>
              Buy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

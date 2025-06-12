import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  return (
    <div className="container">
      <h2>📊 Dashboard (All Listings)</h2>
      <p>Total Accounts: {accounts.length}</p>

      <ul>
        {accounts.map(acc => (
          <li key={acc.id}>
            {acc.username} - ₱{acc.price} - Seller: {acc.sellerName || 'Admin'}
          </li>
        ))}
      </ul>
    </div>
  );
}

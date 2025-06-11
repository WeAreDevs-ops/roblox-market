import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './styles.css'; // We'll create this light css file

export default function Home() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  const buyNow = () => {
    Swal.fire({
      title: 'Contact Me',
      html: `Contact me on:<br>
        <a href="https://www.facebook.com/mix.nthe.clubb" target="_blank">Facebook</a><br>
        <a href="https://discord.gg/P5xRPech" target="_blank">Discord</a>`,
      icon: 'info'
    });
  };

  return (
    <div className="container">
      <h2 className="main-title">Available Accounts</h2>
      <div className="accounts-grid">
        {accounts.map(acc => (
          <div key={acc.id} className="account-card">
            <h3>{acc.username}</h3>

            <p><span>🎂 Age:</span> <span className={`badge ${acc.age === '13+' ? 'green' : 'red'}`}>{acc.age}</span></p>
            <p><span>📧 Email:</span> <span className={`badge ${acc.email === 'Verified' ? 'blue' : 'yellow'}`}>{acc.email}</span></p>
            <p><span>💰 Price:</span> ₱{acc.price}</p>
            <p><span>💎 Robux Balance:</span> {acc.robuxBalance}</p>
            <p><span>🎯 Limited Items:</span> {acc.limitedItems}</p>
            <p><span>📦 Inventory:</span> <span className={`badge ${acc.inventory === 'Public' ? 'green' : 'red'}`}>{acc.inventory}</span></p>
            <p><span>🎮 Games:</span> {acc.games?.filter(g => g).join(", ")}</p>
            <p><span>⚖️ Negotiable:</span> <span className={`badge ${acc.negotiable === 'Yes' ? 'green' : 'red'}`}>{acc.negotiable}</span></p>

            <p><span>🔗 Profile:</span> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>

            <button onClick={buyNow} className="buy-button">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

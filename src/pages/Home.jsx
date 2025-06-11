import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Accounts:</h2>
      {accounts.map(acc => (
        <div
          key={acc.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff'
          }}
        >
          <h3 style={{ marginBottom: '15px', fontSize: '24px', color: '#333' }}>{acc.username}</h3>
          <p><strong>🎂 Age:</strong> {acc.age}</p>
          <p><strong>📧 Email:</strong> {acc.email}</p>
          <p><strong>💰 Price:</strong> ₱{acc.price}</p>
          <p><strong>💳 MOP:</strong> {acc.mop}</p>
          <p><strong>⚖️ Negotiable:</strong> {acc.negotiable}</p>
          <p><strong>🔗 Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>
          <p><strong>💎 Robux Balance:</strong> {acc.robuxBalance}</p>
          <p><strong>🎯 Limited Items:</strong> {acc.limitedItems}</p>
          <p><strong>📦 Inventory:</strong> {acc.inventory}</p>
          <p><strong>🎮 Games:</strong> {acc.games?.filter(g => g).join(", ")}</p>

          <button
            onClick={buyNow}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              marginTop: '20px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: '0.3s',
            }}
            onMouseOver={e => e.target.style.background = '#0056b3'}
            onMouseOut={e => e.target.style.background = '#007bff'}
          >
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}

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
      title: '📞 Contact Me',
      html: `Contact me on:<br>
        <a href="https://www.facebook.com/mix.nthe.clubb" target="_blank">Facebook</a><br>
        <a href="https://discord.gg/P5xRPech" target="_blank">Discord</a>`,
      icon: 'info'
    });
  };

  return (
    <div className="container">
      <h2>Available Accounts</h2>
      {accounts.map(acc => (
        <div key={acc.id} style={{
          border: '1px solid #ccc',
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '8px',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>{acc.username}</h3>

          <p><strong>🎂 Age:</strong> <span style={{ color: acc.age === '13+' ? 'green' : 'red', fontWeight: 'bold' }}>{acc.age}</span></p>

          <p><strong>📧 Email:</strong> <span style={{ color: acc.email === 'Verified' ? 'green' : 'orange', fontWeight: 'bold' }}>{acc.email}</span></p>

          <p><strong>💰 Price:</strong> <span style={{ color: 'blue', fontWeight: 'bold' }}>₱{acc.price}</span></p>

          <p><strong>💳 MOP:</strong> <span style={{ fontWeight: 'bold' }}>{acc.mop}</span></p>

          <p><strong>🤝 Negotiable:</strong> <span style={{ color: acc.negotiable === 'Yes' ? 'green' : 'red', fontWeight: 'bold' }}>{acc.negotiable}</span></p>

          <p><strong>🔗 Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>

          <p><strong>💎 Robux Balance:</strong> <span style={{ fontWeight: 'bold' }}>{acc.robuxBalance}</span></p>

          <p><strong>🎖️ Limited Items:</strong> <span style={{ fontWeight: 'bold' }}>{acc.limitedItems}</span></p>

          <p><strong>📦 Inventory:</strong> <span style={{ fontWeight: 'bold' }}>{acc.inventory}</span></p>

          <p><strong>🎮 Games:</strong> <span style={{ fontWeight: 'bold' }}>{acc.games?.filter(g => g).join(", ")}</span></p>

          <button onClick={buyNow} style={{
            padding: '10px 20px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            marginTop: '10px',
            borderRadius: '5px'
          }}>
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}

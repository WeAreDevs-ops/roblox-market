import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");

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

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase()) ||
    acc.games?.join(", ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Accounts</h2>

      <input
        type="text"
        placeholder="🔎 Search by username or game..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto 20px auto",
          display: "block",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      {filteredAccounts.length === 0 && <p style={{ textAlign: 'center' }}>No results found.</p>}

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{
          border: '1px solid #ccc',
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>{acc.username}</h3>
          <p><strong>🎂 Age:</strong> {acc.age}</p>
          <p><strong>📧 Email:</strong> {acc.email}</p>
          <p><strong>💰 Price:</strong> ₱{acc.price}</p>
          <p><strong>💳 MOP:</strong> {acc.mop}</p>
          <p><strong>🤝 Negotiable:</strong> {acc.negotiable}</p>
          <p><strong>🔗 Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>
          <p><strong>💎 Robux Balance:</strong> {acc.robuxBalance}</p>
          <p><strong>🎖️ Limited Items:</strong> {acc.limitedItems}</p>
          <p><strong>📦 Inventory:</strong> {acc.inventory}</p>
          <p><strong>🎮 Games:</strong> {acc.games?.filter(g => g).join(", ")}</p>

          <button onClick={buyNow} style={{
            padding: '10px 20px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            marginTop: '10px'
          }}>
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}

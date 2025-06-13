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
    (acc.gamepass || "").toLowerCase().includes(search.toLowerCase())
  );

  const Tag = ({ text, color }) => (
    <span style={{
      backgroundColor: color, color: '#fff', padding: '3px 10px',
      borderRadius: '20px', fontSize: '0.85rem', marginLeft: '8px', fontWeight: 'bold'
    }}>{text}</span>
  );

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Available Accounts</h2>

      <input type="text" placeholder="🔎 Search by username or gamepass..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", width: "100%", maxWidth: "400px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" }} 
      />

      {filteredAccounts.length === 0 && <p>No results found.</p>}

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
          <h3>{acc.username}</h3>

          {acc.avatar && <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            <Tag text={`🎂 Age: ${acc.age}`} color="#243c6b" />
            <Tag text={`📧 Email: ${acc.email}`} color="#243c6b" />
            <Tag text={`💰 Price: ₱${acc.price}`} color="#243c6b" />
            <Tag text={`💳 MOP: ${acc.mop}`} color="#243c6b" />
            <Tag text={`🤝 Negotiable: ${acc.negotiable}`} color="#243c6b" />
            <Tag text={`💎 Robux: ${acc.robuxBalance}`} color="#243c6b" />
            <Tag text={`🎖 Limited: ${acc.limitedItems}`} color="#243c6b" />
            <Tag text={`📦 Inventory: ${acc.inventory}`} color="#243c6b" />
            <Tag text={`🌍 Type: ${acc.accountType}`} color="#243c6b" />
          </div>

          <div style={{ marginTop: "10px" }}>
            <strong>🔗 Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a>
          </div>

          <div style={{ marginTop: "10px" }}>
            <strong>🎮 Gamepass:</strong>{" "}
            {acc.gamepass && acc.gamepass.trim() !== "" ? (
              <Tag text={acc.gamepass} color="#243c6b" />
            ) : (
              <Tag text="No Gamepass Found" color="#999" />
            )}
          </div>

          <button onClick={buyNow} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', marginTop: '15px', borderRadius: '5px' }}>
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}

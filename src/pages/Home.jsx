import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

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

  let filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(search.toLowerCase()) ||
    (acc.gamepass || "").toLowerCase().includes(search.toLowerCase())
  );

  if (emailFilter) {
    filteredAccounts = filteredAccounts.filter(acc => acc.email === emailFilter);
  }

  if (sortOption === "low-high") {
    filteredAccounts = filteredAccounts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "high-low") {
    filteredAccounts = filteredAccounts.sort((a, b) => b.price - a.price);
  }

  const resetFilters = () => {
    setSearch("");
    setSortOption("");
    setEmailFilter("");
  };

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

      <div style={{ marginBottom: "15px" }}>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: "8px", marginRight: "10px" }}>
          <option value="">Sort Price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>

        <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} style={{ padding: "8px", marginRight: "10px" }}>
          <option value="">Email Status</option>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
        </select>

        <button onClick={resetFilters} style={{ padding: "8px 15px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px" }}>
          Reset
        </button>
      </div>

      {filteredAccounts.length === 0 && <p>No results found.</p>}

      {filteredAccounts.map(acc => (
        <div key={acc.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
          <h3>{acc.username}</h3>

          {acc.avatar && <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />}

          {/* ALIGNMENT FIXED HERE */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "120px auto", 
            rowGap: "10px", 
            columnGap: "10px", 
            marginBottom: "15px" 
          }}>
            <div>🎂 Age:</div>
            <div><Tag text={acc.age} color="#243c6b" /></div>

            <div>📧 Email:</div>
            <div><Tag text={acc.email} color="#243c6b" /></div>

            <div>💰 Price:</div>
            <div><Tag text={`₱${acc.price}`} color="#243c6b" /></div>

            <div>💳 MOP:</div>
            <div><Tag text={acc.mop} color="#243c6b" /></div>

            <div>🤝 Negotiable:</div>
            <div><Tag text={acc.negotiable} color="#243c6b" /></div>

            <div>💎 Robux:</div>
            <div><Tag text={acc.robuxBalance} color="#243c6b" /></div>

            <div>🎖 Limited:</div>
            <div><Tag text={acc.limitedItems} color="#243c6b" /></div>

            <div>📦 Inventory:</div>
            <div><Tag text={acc.inventory} color="#243c6b" /></div>

            <div>🌍 Type:</div>
            <div><Tag text={acc.accountType} color="#243c6b" /></div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>🔗 Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>🎮 Gamepass:</strong>{" "}
            {acc.gamepass && acc.gamepass.trim() !== "" ? (
              acc.gamepass.split(",").map((game, index) => (
                <Tag key={index} text={game.trim()} color="#243c6b" />
              ))
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

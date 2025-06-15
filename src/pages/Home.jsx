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

  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
      <strong>{label}</strong>
      <Tag text={value} color="#243c6b" />
    </div>
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

          <div style={{ marginTop: '15px' }}>
            <DetailRow label="📝 Total Summary:" value={acc.totalSummary || "N/A"} />
            <DetailRow label="🎂 Age:" value={acc.age} />
            <DetailRow label="📧 Email:" value={acc.email} />
            <DetailRow label="💰 Price:" value={`₱${acc.price}`} />
            <DetailRow label="💳 MOP:" value={acc.mop} />
            <DetailRow label="🤝 Negotiable:" value={acc.negotiable} />
            <DetailRow label="💎 Robux:" value={acc.robuxBalance} />
            <DetailRow label="🎖 Limited:" value={acc.limitedItems} />

            {/* 🚀 New Automated Fields */}
            <DetailRow label="📊 RAP Value:" value={acc.limitedValue || "N/A"} />
            <DetailRow label="⭐ Premium:" value={acc.premium || "Unknown"} />

            <DetailRow label="📦 Inventory:" value={acc.inventory} />
            <DetailRow label="🌍 Type:" value={acc.accountType} />
          </div>

          <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <strong>🔗 Profile:</strong>&nbsp;
            <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a>
          </div>

          <div style={{ marginTop: "10px" }}>
            <strong>🎮 Games with Gamepass:</strong>
            <div style={{ 
              marginTop: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '5px', 
              maxHeight: '150px', 
              overflowY: 'auto', 
              paddingRight: '5px',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}>
              {acc.gamepass && acc.gamepass.trim() !== "" ? (
                acc.gamepass.split(",").map((game, index) => (
                  <Tag key={index} text={game.trim()} color="#243c6b" />
                ))
              ) : (
                <Tag text="No Gamepass Found" color="#999" />
              )}
            </div>
          </div>

          <button onClick={buyNow} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', marginTop: '15px', borderRadius: '5px' }}>
            Contact Me
          </button>
        </div>
      ))}
    </div>
  );
              }

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function SellerPanel() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    fetch('/api/seller-accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts))
      .catch(err => console.error("Failed to fetch seller accounts:", err));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  let filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase())
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
      backgroundColor: color, color: '#000', padding: '3px 10px',
      borderRadius: '20px', fontSize: '0.85rem', marginLeft: '8px', fontWeight: 'bold'
    }}>{text}</span>
  );

  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
      <strong>{label}</strong>
      <span className="badge">{value}</span>
    </div>
  );

  const buyNow = () => {
    Swal.fire({
      title: 'Contact Seller',
      text: 'Please message the seller on Facebook or Discord to buy this account.',
      icon: 'info'
    });
  };

  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`} style={{ padding: "20px", minHeight: '100vh' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>All Seller Listings</h2>
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider round"></span>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}>
        <input 
          type="text" 
          placeholder="🔎 Search by username..."
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort Price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>

        <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)}>
          <option value="">Email Status</option>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
        </select>

        <button className="delete" onClick={resetFilters}>Reset</button>
      </div>

      {filteredAccounts.length === 0 && <p>No listings found.</p>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredAccounts.map(acc => (
          <div key={acc.id} className="card" style={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
            <h3>{acc.username}</h3>

            <div style={{ marginTop: '15px' }}>
              <DetailRow label="➤ Price:" value={`₱${acc.price}`} />
              <DetailRow label="➤ Summary:" value={acc.totalSummary || "N/A"} />
              <DetailRow label="➤ Premium:" value={acc.premium === "True" ? "Yes" : "No"} />
              <DetailRow label="➤ Email:" value={acc.email} />
              <DetailRow label="➤ Robux:" value={acc.robuxBalance} />
              <DetailRow label="➤ Inventory:" value={acc.inventory} />
              <DetailRow label="➤ Type:" value={acc.accountType} />
              <DetailRow label="➤ MOP:" value={acc.mop} />
              <DetailRow label="➤ Gamepass:" value={acc.gamepass || "None"} />
            </div>

            <div className="buttons" style={{ marginTop: "10px" }}>
              <button onClick={buyNow} className="delete">
                Contact Seller
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        .switch input { display: none; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0;
          right: 0; bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #2196F3;
        }
        input:checked + .slider:before {
          transform: translateX(18px);
        }
        .dark-mode {
          background-color: #121212 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [negotiableFilter, setNegotiableFilter] = useState("All");
  const [emailFilter, setEmailFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const resetFilters = () => {
    setSearch("");
    setNegotiableFilter("All");
    setEmailFilter("All");
    setSortOrder("none");
    setCurrentPage(1);
  };

  let filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(search.toLowerCase()) ||
    acc.games?.join(", ").toLowerCase().includes(search.toLowerCase())
  );

  if (negotiableFilter !== "All") {
    filteredAccounts = filteredAccounts.filter(acc => acc.negotiable === negotiableFilter);
  }

  if (emailFilter !== "All") {
    filteredAccounts = filteredAccounts.filter(acc => 
      (emailFilter === "Verified" ? acc.email === "Verified" : acc.email !== "Verified")
    );
  }

  if (sortOrder === "low-high") {
    filteredAccounts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "high-low") {
    filteredAccounts.sort((a, b) => b.price - a.price);
  }

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container">
      <h2>Available Accounts</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔎 Search by username or game..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "10px"
          }}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          <select value={negotiableFilter} onChange={(e) => { setNegotiableFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">🤝 Negotiable (All)</option>
            <option value="Yes">✅ Yes</option>
            <option value="No">❌ No</option>
          </select>

          <select value={emailFilter} onChange={(e) => { setEmailFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">📧 Email (All)</option>
            <option value="Verified">✅ Verified</option>
            <option value="Unverified">❌ Unverified</option>
          </select>

          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}>
            <option value="none">📊 Sort</option>
            <option value="low-high">⬆️ Price Low - High</option>
            <option value="high-low">⬇️ Price High - Low</option>
          </select>

          <button onClick={resetFilters} style={{
            padding: "8px 15px",
            background: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "5px"
          }}>
            🔄 Reset
          </button>
        </div>
      </div>

      {displayedAccounts.length === 0 && <p>No results found.</p>}

      {displayedAccounts.map(acc => (
        <div key={acc.id} style={{
          border: '1px solid #ccc',
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '8px',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>{acc.username}</h3>

          {acc.avatar && (
            <div style={{ marginBottom: "10px" }}>
              <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />
            </div>
          )}

          <p><strong>🎂 Age:</strong> <span style={{ backgroundColor: acc.age === '13+' ? '#4CAF50' : '#f44336', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.age}</span></p>
          <p><strong>📧 Email:</strong> <span style={{ backgroundColor: acc.email === 'Verified' ? '#4CAF50' : '#ff9800', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.email}</span></p>
          <p><strong>💰 Price:</strong> <span style={{ backgroundColor: '#2196f3', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>₱{acc.price}</span></p>
          <p><strong>💳 MOP:</strong> <span style={{ backgroundColor: '#9c27b0', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.mop}</span></p>
          <p><strong>🤝 Negotiable:</strong> <span style={{ backgroundColor: acc.negotiable === 'Yes' ? '#4CAF50' : '#f44336', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.negotiable}</span></p>
          <p><strong>💎 Limited Items:</strong> <span style={{ backgroundColor: '#795548', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.limitedItems}</span></p>
          <p><strong>📦 Inventory:</strong> <span style={{ backgroundColor: '#607d8b', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.inventory}</span></p>
          <p><strong>🎮 Games/Gamepass:</strong> <span style={{ backgroundColor: '#03a9f4', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.games?.filter(g => g).join(", ")}</span></p>
          <p><strong>🌍 Account Type:</strong> <span style={{ backgroundColor: '#ff5722', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.accountType}</span></p>
          <p><strong>💎 Robux Balance:</strong> <span style={{ backgroundColor: '#ff9800', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{acc.robuxBalance} Robux</span></p>

          <p style={{ marginTop: "10px" }}>
            🔗 <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a>
          </p>

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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>⬅️ Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev =><button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Next ➡️</button>
        </div>
      )}
    </div>
  );
      }

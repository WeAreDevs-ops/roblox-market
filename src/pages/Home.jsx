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
      title: 'ðŸ“ž Contact Me',
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
          placeholder="ðŸ”Ž Search by username or game..."
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
            <option value="All">ðŸ¤ Negotiable (All)</option>
            <option value="Yes">âœ… Yes</option>
            <option value="No">âŒ No</option>
          </select>

          <select value={emailFilter} onChange={(e) => { setEmailFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">ðŸ“§ Email (All)</option>
            <option value="Verified">âœ… Verified</option>
            <option value="Unverified">âŒ Unverified</option>
          </select>

          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}>
            <option value="none">ðŸ“Š Sort</option>
            <option value="low-high">â¬†ï¸ Price Low - High</option>
            <option value="high-low">â¬‡ï¸ Price High - Low</option>
          </select>

          <button onClick={resetFilters} style={{
            padding: "8px 15px",
            background: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "5px"
          }}>
            ðŸ”„ Reset
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

          <p><strong>ðŸŽ‚ Age:</strong> <span style={{ color: acc.age === '13+' ? 'green' : 'red', fontWeight: 'bold' }}>{acc.age}</span></p>

          <p><strong>ðŸ“§ Email:</strong> <span style={{ color: acc.email === 'Verified' ? 'green' : 'orange', fontWeight: 'bold' }}>{acc.email}</span></p>

          <p><strong>ðŸ’° Price:</strong> <span style={{ color: 'blue', fontWeight: 'bold' }}>â‚±{acc.price}</span></p>

          <p><strong>ðŸ’³ MOP:</strong> <span style={{ fontWeight: 'bold' }}>{acc.mop}</span></p>

          <p><strong>ðŸ¤ Negotiable:</strong> <span style={{ color: acc.negotiable === 'Yes' ? 'green' : 'red', fontWeight: 'bold' }}>{acc.negotiable}</span></p>

          <p><strong>ðŸ”— Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>

          <p><strong>ðŸ’Ž Robux Balance:</strong> <span style={{ fontWeight: 'bold' }}>{acc.robuxBalance}</span></p>

          <p><strong>ðŸŽ–ï¸ Limited Items:</strong> <span style={{ fontWeight: 'bold' }}>{acc.limitedItems}</span></p>

          <p><strong>ðŸ“¦ Inventory:</strong> <span style={{ fontWeight: 'bold' }}>{acc.inventory}</span></p>

          <p><strong>ðŸŽ® Games:</strong> <span style={{ fontWeight: 'bold' }}>{acc.games?.filter(g => g).join(", ")}</span></p>

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
          <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>â¬…ï¸ Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Next âž¡ï¸</button>
        </div>
      )}
    </div>
  );
                          }

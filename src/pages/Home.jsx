import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    totalAccounts: 0,
    sellerCount: 0,
    totalRevenue: 0,
    newStock: 0
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/dashboard-stats')
        .then(res => res.json())
        .then(data => {
          setDashboardStats(data);
        })
        .catch(err => console.error(err));
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    if (window.location.pathname === "/") {
      document.body.style.backgroundColor = darkMode ? '#121212' : '#ffffff';
    }
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [darkMode]);

  const showContact = (acc) => {
    const fb = acc.facebookLink;

    if (!fb) {
      Swal.fire({
        title: 'No Contact Info',
        text: 'This seller did not provide a Facebook link.',
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
      title: 'Contact Me',
      html: `Contact me on:<br><a href="${fb}" target="_blank">Facebook</a>`,
      icon: 'info'
    });
  };

  let filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(search.toLowerCase()) ||
    (acc.gamepass || "").toLowerCase().includes(search.toLowerCase()) ||
    (acc.seller || "").toLowerCase().includes(search.toLowerCase())
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

  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`} style={{ padding: "20px", minHeight: '100vh' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Available Accounts</h2>
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider round"></span>
        </label>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
        className="dashboard-grid"
      >
        <div className="badge">Total Accounts: {dashboardStats.totalAccounts}</div>
        <div className="badge">Total Revenue: ₱{dashboardStats.totalRevenue}</div>
        <div className="badge">Daily New Stock: {dashboardStats.newStock}</div>
        <div className="badge">Total Sellers: {dashboardStats.sellerCount}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}
      >
        <input 
          type="text" 
          placeholder="🔎 Search by username, seller or gamepass..."
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
      </motion.div>

      {filteredAccounts.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          No results found.
        </motion.p>
      )} <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <AnimatePresence>
          {filteredAccounts.map(acc => (
            <motion.div
              key={acc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}
            >
              {acc.avatar && (
                <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />
              )}

              <h3>{acc.username}</h3>

              {acc.seller && (
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: darkMode ? '#aaa' : '#444' }}>
                  Seller: {acc.seller}
                </div>
              )}

              <div style={{ marginTop: '15px' }}>
                <DetailRow label="➤ Price:" value={`₱${acc.price}`} />
                <DetailRow label="➤ Total Summary:" value={acc.totalSummary || "N/A"} />
                <DetailRow label="➤ Premium Status:" value={acc.premium === "True" ? "True" : "False"} />
              </div>

              <AnimatePresence>
                {expandedId === acc.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden', marginTop: '15px' }}
                  >
                    <DetailRow label="➤ Age:" value={acc.age ? `${acc.age} Days` : 'N/A'} />
                    <DetailRow label="➤ Email:" value={acc.email} />
                    <DetailRow label="➤ Robux Balance:" value={acc.robuxBalance} />
                    <DetailRow label="➤ Limited item:" value={acc.limitedItems} />
                    <DetailRow label="➤ Inventory:" value={acc.inventory} />
                    <DetailRow label="🌍 Type:" value={acc.accountType} />
                    <DetailRow label="💳 MOP:" value={acc.mop} />

                    <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>🔗 Profile:</strong>&nbsp;
                      <a href={acc.profile} target="_blank" rel="noreferrer" style={{ color: '#ceb2eb', fontWeight: 'bold' }}> View Profile </a>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <strong>🎮 Games with Gamepasses:</strong>
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
                            <Tag key={index} text={game.trim()} color="#ceb2eb" />
                          ))
                        ) : (
                          <Tag text="No Gamepass Found" color="#999" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="buttons" style={{ marginTop: "10px" }}>
                <button onClick={() => setExpandedId(expandedId === acc.id ? null : acc.id)} className="buy">
                  {expandedId === acc.id ? 'Hide Details' : 'View Details'}
                </button>
                <button onClick={() => showContact(acc)} className="delete" style={{ marginLeft: '10px' }}>
                  Contact Me
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
        body {
          transition: background-color 0.3s ease;
        }

        @media screen and (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

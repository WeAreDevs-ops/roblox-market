import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    totalAccounts: 0,
    salesCount: 0,
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
    let currentSalesCount = 0;
    const fetchAndStartCounter = () => {
      fetch('/api/dashboard-stats')
        .then(res => res.json())
        .then(data => {
          setDashboardStats(data);
          currentSalesCount = data.salesCount;
          const interval = setInterval(() => {
            currentSalesCount += 1;
            setDashboardStats(prev => ({ ...prev, salesCount: currentSalesCount }));
          }, 60000);
          return () => clearInterval(interval);
        })
        .catch(err => console.error(err));
    };
    fetchAndStartCounter();
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#121212' : '#ffffff';
  }, [darkMode]);

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

      {/* ✅ UPDATED DASHBOARD STATS SECTION */}
      <div className="dashboard-stats">
        <div className="badge">Total Accounts: {dashboardStats.totalAccounts}</div>
        <div className="badge">Total Revenue: ₱{dashboardStats.totalRevenue}</div>
        <div className="badge">Daily New Stock: {dashboardStats.newStock}</div>
        <div className="badge">Live Sales: {dashboardStats.salesCount}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}>
        <input 
          type="text" 
          placeholder="🔎 Search by username or gamepass..."
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

      {filteredAccounts.length === 0 && <p>No results found.</p>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredAccounts.map(acc => (
          <div key={acc.id} className="card" style={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
            <h3>{acc.username}</h3>

            {acc.avatar && <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />}

            <div style={{ marginTop: '15px' }}>
              <DetailRow label="➤ 𝗣𝗿𝗶𝗰𝗲:" value={`₱${acc.price}`} />
              <DetailRow label="➤ 𝗧𝗼𝘁𝗮𝗹 𝗦𝘂𝗺𝗺𝗮𝗿𝘆:" value={acc.totalSummary || "N/A"} />
              <DetailRow label="➤ 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗦𝘁𝗮𝘁𝘂𝘀:" value={acc.premium === "True" ? "True" : "False"} />
            </div>

            {expandedId === acc.id && (
              <div style={{ marginTop: '15px' }}>
                <DetailRow label="➤ 𝗔𝗴𝗲:" value={acc.age ? `${acc.age} Days` : 'N/A'} />
                <DetailRow label="➤ 𝗘𝗺𝗮𝗶𝗹:" value={acc.email} />
                <DetailRow label="➤ 𝗥𝗼𝗯𝘂𝘅 𝗕𝗮𝗹𝗮𝗻𝗰𝗲:" value={acc.robuxBalance} />
                <DetailRow label="➤ 𝗟𝗶𝗺𝗶𝘁𝗲𝗱 𝗶𝘁𝗲𝗺:" value={acc.limitedItems} />
                <DetailRow label="➤ 𝗜𝗻𝘃𝗲𝗻𝘁𝗼𝗿𝘆:" value={acc.inventory} />
                <DetailRow label="🌍 𝗧𝘆𝗽𝗲:" value={acc.accountType} />
                <DetailRow label="💳 𝗠𝗢𝗣:" value={acc.mop} />

                <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲:</strong>&nbsp;
                  <a href={acc.profile} target="_blank" rel="noreferrer" style={{ color: '#ceb2eb', fontWeight: 'bold' }} > View Profile </a>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <strong>🎮 𝗚𝗮𝗺𝗲𝘀 𝘄𝗶𝘁𝗵 𝗚𝗮𝗺𝗲𝗽𝗮𝘀𝘀𝗲𝘀:</strong>
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
              </div>
            )}

            <div className="buttons" style={{ marginTop: "10px" }}>
              <button onClick={() => setExpandedId(expandedId === acc.id ? null : acc.id)} className="buy">
                {expandedId === acc.id ? 'Hide Details' : 'View Details'}
              </button>
              <button onClick={buyNow} className="delete" style={{ marginLeft: '10px' }}>
                Contact Me
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
        body {
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  );
        }

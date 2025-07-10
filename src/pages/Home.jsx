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

  const [robuxListings, setRobuxListings] = useState([]);
  const [viewType, setViewType] = useState('accounts'); // 'accounts' or 'robux'
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.accounts));
  }, []);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then(res => res.json())
      .then(data => setDashboardStats(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch('/api/robux')
      .then(res => res.json())
      .then(data => setRobuxListings(data.robuxList || []))
      .catch(err => console.error('Failed to fetch robux listings:', err));
  }, []);

  const showContact = (acc) => {
    const fb = acc.facebookLink || acc.contact;
    if (!fb) {
      Swal.fire({
        title: 'No Contact Info',
        text: 'This seller did not provide a contact link.',
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

  // ACCOUNT FILTERS
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

  // ROBUX FILTERS
  let filteredRobux = robuxListings.filter(item =>
    item.via.toLowerCase().includes(search.toLowerCase()) ||
    item.seller.toLowerCase().includes(search.toLowerCase())
  );

  if (sortOption === "low-high") {
    filteredRobux = filteredRobux.sort((a, b) => a.price - b.price);
  } else if (sortOption === "high-low") {
    filteredRobux = filteredRobux.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="container" style={{ padding: "20px", minHeight: '100vh' }}>
      {/* Dashboard Summary */}
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}
      >
        <input 
          type="text" 
          placeholder={
            viewType === 'accounts'
              ? "🔎 Search by username, seller or gamepass..."
              : "🔎 Search by via or seller..."
          }
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort Price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>
        {viewType === 'accounts' && (
          <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)}>
            <option value="">Email Status</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        )}
        <button className="delete" onClick={resetFilters}>Reset</button>
      </motion.div>

      {/* View Toggle */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setViewType('accounts')} 
          style={{
            marginRight: '10px',
            padding: '8px 20px',
            borderRadius: '8px',
            backgroundColor: viewType === 'accounts' ? '#7DC387' : '#ddd',
            color: viewType === 'accounts' ? 'white' : 'black',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          ACCOUNT LIST
        </button>
        <button 
          onClick={() => setViewType('robux')} 
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            backgroundColor: viewType === 'robux' ? '#7DC387' : '#ddd',
            color: viewType === 'robux' ? 'white' : 'black',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          ROBUX LIST
        </button>
      </div>

      {/* Render Based on View */}
      {viewType === 'accounts' ? (
        <>
          {filteredAccounts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No results found.
            </motion.p>
          ) : (
            <div style={{ 
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
                  >
                    {acc.avatar && (
                      <img src={acc.avatar} alt={`${acc.username} avatar`} style={{ width: "150px", borderRadius: "10px" }} />
                    )}

                    <h3>{acc.username}</h3>
                    {acc.seller && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
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
                                  <Tag key={index} text={game.trim()} color="#7DC387" />
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
          )}
        </>
      ) : (
        <>
          {filteredRobux.length === 0 ? (
            <p>No Robux listings found.</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {filteredRobux.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="card"
                >
                  <h3>Robux: {item.amount}</h3>
                  <DetailRow label="➤ Via:" value={item.via} />
                  <DetailRow label="➤ Price:" value={`₱${item.price}`} />
                  <DetailRow label="➤ Seller:" value={item.seller} />
                  <div className="buttons" style={{ marginTop: "10px" }}>
                    <button onClick={() => showContact(item)} className="delete">
                      Contact Me
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
    }

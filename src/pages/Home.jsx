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

  // Filters for account listings
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

  // ✅ Filters for robux listings (only price, via, and seller)
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

      {/* Toggle Buttons */}
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

      {viewType === 'accounts' ? (
        <>
          {/* ... (your account list rendering unchanged) */}
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

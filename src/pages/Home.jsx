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

  function getAssetTypeName(typeId) {
    const types = {
      1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
      18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
      43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
      46: "Back Accessory", 47: "Waist Accessory"
    };
    return types[typeId] || "Unknown";
  }

  async function fetchLimitedItem() {
    const assetId = document.getElementById("assetIdInput").value;
    if (!assetId) return alert("Please enter an Asset ID");

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<div style='padding: 20px;text-align: center;'><span class='loader'></span> Loading item details...</div>";

    try {
      const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
      const details = await detailsRes.json();

      const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
      const thumbData = await thumbRes.json();
      const thumbnail = thumbData.data[0]?.imageUrl || "";

      const resalePrice = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
      const formattedResale = resalePrice ? ` ${resalePrice.toLocaleString()} Robux` : "🔴 Offsale";
      const resaleInPHP = resalePrice ? ` ₱${(resalePrice * 0.15).toLocaleString()} PHP` : "N/A";

      resultDiv.innerHTML = `
      <div class="card" style="padding: 20px; text-align: left;">
        <h2 style="margin-bottom: 10px; color: #333; font-weight: bold;">${details.Name}</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1;">
            <img src="${thumbnail}" alt="Item Thumbnail" style="width: 100%; max-width: 250px; border-radius: 10px; border: 1px solid #ddd;" />
          </div>
          <div style="flex: 2;">
            <div style="margin-bottom: 8px;">
              <strong>Creator:</strong> 
              <span style="color: #555;">${details.Creator?.Name || "N/A"}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Lowest Resale:</strong> 
              <span style="color: #7DC387; font-weight: bold;">${formattedResale}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>BlackMarket Value:</strong> 
              <span style="color: #555;">${resaleInPHP}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Type:</strong> 
              <span style="color: #555;">${getAssetTypeName(details.AssetTypeId)}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Limited Status:</strong> 
              ${details.IsLimited ? 
                "<span style='background: #7DC387; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;'>✅ Limited</span>" : 
                "<span style='background: #FF4C4C; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;'>❌ Not Limited</span>"}
            </div>
            <div>
              <strong>Unique Status:</strong> 
              ${details.IsLimitedUnique ? 
                "<span style='background: #7DC387; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;'>🌟 Unique</span>" : 
                "<span style='background: #555; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;'>Not Unique</span>"}
            </div>
          </div>
        </div>
      </div>
      `;
      
    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "<div class='card' style='padding: 20px; color: #FF4C4C;'><strong>❌ Error:</strong> Failed to fetch item. Make sure the Asset ID is valid.</div>";
    }
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '32px'
        }}
        className="dashboard-grid"
      >
        <div className="badge" style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'center' }}>
          Total Accounts: {dashboardStats.totalAccounts}
        </div>
        <div className="badge" style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'center' }}>
          Total Revenue: ₱{dashboardStats.totalRevenue}
        </div>
        <div className="badge" style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'center' }}>
          Daily New Stock: {dashboardStats.newStock}
        </div>
        <div className="badge" style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'center' }}>
          Total Sellers: {dashboardStats.sellerCount}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "12px", 
          marginBottom: "24px",
          padding: "20px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)"
        }}
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
          style={{ marginBottom: 0 }}
        />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ marginBottom: 0 }}>
          <option value="">Sort Price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>
        {viewType === 'accounts' && (
          <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">Email Status</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        )}
        <button className="delete" onClick={resetFilters} style={{ marginTop: 0 }}>Reset Filters</button>
      </motion.div>

      {/* View Toggle */}
      <div style={{ 
        textAlign: "center", 
        margin: "24px 0", 
        display: "flex", 
        justifyContent: "center", 
        gap: "8px", 
        flexWrap: "wrap",
        background: "rgba(255, 255, 255, 0.1)",
        padding: "8px",
        borderRadius: "16px",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <button 
          onClick={() => setViewType('accounts')} 
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: viewType === 'accounts' ? 'linear-gradient(135deg, #7DC387, #667eea)' : 'rgba(255, 255, 255, 0.3)',
            color: viewType === 'accounts' ? 'white' : '#333',
            border: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '14px',
            boxShadow: viewType === 'accounts' ? '0 4px 15px rgba(125, 195, 135, 0.4)' : 'none'
          }}
        >
          ACCOUNT LIST
        </button>
        <button 
          onClick={() => setViewType('robux')} 
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: viewType === 'robux' ? 'linear-gradient(135deg, #7DC387, #667eea)' : 'rgba(255, 255, 255, 0.3)',
            color: viewType === 'robux' ? 'white' : '#333',
            border: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '14px',
            boxShadow: viewType === 'robux' ? '0 4px 15px rgba(125, 195, 135, 0.4)' : 'none'
          }}
        >
          ROBUX LIST
        </button>
        <button 
          onClick={() => setViewType('limitedChecker')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: viewType === 'limitedChecker' ? 'linear-gradient(135deg, #7DC387, #667eea)' : 'rgba(255, 255, 255, 0.3)',
            color: viewType === 'limitedChecker' ? 'white' : '#333',
            border: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '14px',
            boxShadow: viewType === 'limitedChecker' ? '0 4px 15px rgba(125, 195, 135, 0.4)' : 'none'
          }}
        >
          LIMITED CHECKER
        </button>
      </div>

      {/* Render Based on View */}
      {viewType === 'limitedChecker' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ maxWidth: '700px', margin: '0 auto' }}
        >
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            marginBottom: '24px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #7DC387, #667eea)'
            }}></div>
            <h2 style={{ 
              textAlign: 'center', 
              marginBottom: '24px', 
              color: '#333',
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #7DC387, #667eea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Limited Item Checker
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                id="assetIdInput"
                type="text"
                placeholder="Enter Roblox Asset ID..."
                style={{ 
                  flex: 1, 
                  padding: '14px 18px', 
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
              />
              <button 
                onClick={fetchLimitedItem}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #7DC387, #667eea)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(125, 195, 135, 0.4)'
                }}
              >
                Check Item
              </button>
            </div>
            <div 
              id="result"
              style={{
                minHeight: '250px',
                border: '2px dashed #e1e5e9',
                borderRadius: '16px',
                padding: '24px',
                background: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s ease'
              }}
            >
              <p style={{ 
                textAlign: 'center', 
                color: '#64748b',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                🔍 Results will appear here
              </p>
            </div>
          </div>
        </motion.div>
      ) : viewType === 'accounts' ? (
        filteredAccounts.length === 0 ? (
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
        )
      ) : (
        filteredRobux.length === 0 ? (
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
        )
      )}
    </div>
  );
        }
        

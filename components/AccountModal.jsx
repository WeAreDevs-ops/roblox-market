import React from 'react';

export default function AccountModal({ account, onClose }) {
  if (!account) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>{account.username}</h2>

        {account.avatar && (
          <img src={account.avatar} alt="avatar" style={{ width: "150px", borderRadius: "10px" }} />
        )}

        <p><strong>🎂 Age:</strong> {account.age}</p>
        <p><strong>📧 Email:</strong> {account.email}</p>
        <p><strong>💰 Price:</strong> ₱{account.price}</p>
        <p><strong>💳 MOP:</strong> {account.mop}</p>
        <p><strong>🤝 Negotiable:</strong> {account.negotiable}</p>
        <p><strong>🔗 Profile:</strong> <a href={account.profile} target="_blank" rel="noreferrer">View Profile</a></p>
        <p><strong>💎 Robux Balance:</strong> {account.robuxBalance}</p>
        <p><strong>🎖️ Limited Items:</strong> {account.limitedItems}</p>
        <p><strong>📦 Inventory:</strong> {account.inventory}</p>
        <p><strong>🎮 Games/Gamepass:</strong> {account.games?.join(", ")}</p>
        <p><strong>🌍 Account Type:</strong> {account.accountType}</p>
        <p><strong>👤 Seller:</strong> {account.sellerName || 'Admin'}</p>
        <p><strong>📞 Contact:</strong> 
          <a href={account.sellerContact} target="_blank" rel="noreferrer">Contact Seller</a>
        </p>

        <button onClick={onClose} style={{ marginTop: "20px" }}>Close</button>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 999
};

const modalContentStyle = {
  background: "#fff", padding: "30px", borderRadius: "10px",
  maxWidth: "500px", width: "100%", textAlign: "center"
};

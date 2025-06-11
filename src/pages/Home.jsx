import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './style.css';

export default function Home() {
  const [accounts, setAccounts] = useState([]);

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

  return (
    <div className="container">
      <h2 className="title">Available Accounts</h2>
      {accounts.map((acc) => (
        <div key={acc.id} className="account-card">
          <h3>{acc.username}</h3>
          <p><strong>Age:</strong> {acc.age}</p>
          <p><strong>Email:</strong> {acc.email}</p>
          <p><strong>Price:</strong> ₱{acc.price}</p>
          <p><strong>MOP:</strong> {acc.mop}</p>
          <p><strong>Negotiable:</strong> {acc.negotiable}</p>
          <p><strong>Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>
          <p><strong>Robux Balance:</strong> {acc.robuxBalance}</p>
          <p><strong>Limited Items:</strong> {acc.limitedItems}</p>
          <p><strong>Inventory:</strong> {acc.inventory}</p>
          <p><strong>Games:</strong> {(acc.games && acc.games.filter((g) => g).join(", ")) || 'None'}</p>
          <button onClick={buyNow} className="buy-btn">
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}

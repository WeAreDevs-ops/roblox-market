import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Home() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(function(res) { return res.json(); })
      .then(function(data) { setAccounts(data.accounts); });
  }, []);

  const buyNow = function() {
    Swal.fire({
      title: 'Contact Me',
      html: 'Contact me on:<br>' +
        '<a href="https://www.facebook.com/mix.nthe.clubb" target="_blank">Facebook</a><br>' +
        '<a href="https://discord.gg/P5xRPech" target="_blank">Discord</a>',
      icon: 'info'
    });
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Accounts</h2>
      {accounts.map(function(acc) {
        var gamesList = 'None';
        if (acc.games && acc.games.length > 0) {
          var filteredGames = acc.games.filter(function(g) { return g; });
          gamesList = filteredGames.join(", ");
        }

        return (
          <div key={acc.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
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
            <p><strong>Games:</strong> {gamesList}</p>
            <button onClick={buyNow} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '10px' }}>
              Buy Now
            </button>
          </div>
        );
      })}
    </div>
  );
}

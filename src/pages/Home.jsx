import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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
        <a href="https://facebook.com/your-facebook" target="_blank">Facebook</a><br>
        <a href="https://discord.gg/your-discord" target="_blank">Discord</a>`,
      icon: 'info'
    });
  };

  return (
    <div className="container">
      <h2>Available Accounts:</h2>
      {accounts.map(acc => (
        <div key={acc.id} className="card">
          <h3>{acc.username}</h3>
          <p>Age: {acc.age}</p>
          <p>Email: {acc.email}</p>
          <button onClick={buyNow} className="buy">Buy Now</button>
        </div>
      ))}
    </div>
  );
}

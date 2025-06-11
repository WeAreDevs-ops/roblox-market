// keep all previous imports

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    username: '',
    age: '13+',
    email: 'Verified',
    profile: '',
    price: '',
    mop: 'Gcash',
    negotiable: 'Yes',
    robuxBalance: '',
    limitedItems: '',
    inventory: 'Public',
    games: ['', '', '']
  });

  // your login, fetchAccounts, deleteAccount remain same

  const addAccount = async () => {
    if (!form.username.trim()) {
      alert("Please enter a username.");
      return;
    }

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      fetchAccounts();
      setForm({
        username: '', age: '13+', email: 'Verified', profile: '', price: '', mop: 'Gcash', negotiable: 'Yes',
        robuxBalance: '', limitedItems: '', inventory: 'Public', games: ['', '', '']
      });
    } else {
      alert('Error adding account');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {!isLoggedIn ? (
        <>
          <h2>Admin Login</h2>
          <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={login} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none' }}>Login</button>
        </>
      ) : (
        <>
          <h2>Add Account</h2>
          <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Roblox Profile URL" value={form.profile} onChange={e => setForm({...form, profile: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Price (PHP)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Robux Balance" value={form.robuxBalance} onChange={e => setForm({...form, robuxBalance: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Limited Items" value={form.limitedItems} onChange={e => setForm({...form, limitedItems: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          
          <select value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Public</option>
            <option>Private</option>
          </select>

          <input type="text" placeholder="Game 1" value={form.games[0]} onChange={e => setForm({...form, games: [e.target.value, form.games[1], form.games[2]]})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Game 2" value={form.games[1]} onChange={e => setForm({...form, games: [form.games[0], e.target.value, form.games[2]]})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="text" placeholder="Game 3" value={form.games[2]} onChange={e => setForm({...form, games: [form.games[0], form.games[1], e.target.value]})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />

          <select value={form.age} onChange={e => setForm({...form, age: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>13+</option>
            <option>{'<13'}</option>
          </select>
          <select value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Verified</option>
            <option>Not Verified</option>
            <option>Add Email</option>
          </select>
          <select value={form.mop} onChange={e => setForm({...form, mop: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Gcash</option>
            <option>Paypal</option>
          </select>
          <select value={form.negotiable} onChange={e => setForm({...form, negotiable: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <button onClick={addAccount} style={{ padding: '10px 20px', background: 'green', color: '#fff', border: 'none' }}>Add Account</button>

          <h2 style={{ marginTop: '30px' }}>All Listings</h2>
          {accounts.length === 0 && <p>No accounts yet.</p>}
          {accounts.map(acc => (
            <div key={acc.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
              <p><strong>Username:</strong> {acc.username}</p>
              <p><strong>Age:</strong> {acc.age}</p>
              <p><strong>Email:</strong> {acc.email}</p>
              <p><strong>Price:</strong> ₱{acc.price}</p>
              <p><strong>MOP:</strong> {acc.mop}</p>
              <p><strong>Negotiable:</strong> {acc.negotiable}</p>
              <p><strong>Profile:</strong> <a href={acc.profile} target="_blank" rel="noreferrer">View Profile</a></p>
              <p><strong>Robux Balance:</strong> {acc.robuxBalance}</p>
              <p><strong>Limited Items:</strong> {acc.limitedItems}</p>
              <p><strong>Inventory:</strong> {acc.inventory}</p>
              <p><strong>Games:</strong> {acc.games?.filter(g => g).join(", ")}</p>
              <button onClick={() => deleteAccount(acc.id)} style={{ padding: '5px 10px', background: 'red', color: '#fff', border: 'none' }}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
            }

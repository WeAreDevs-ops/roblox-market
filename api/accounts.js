let accounts = []; // This is just in-memory, you can replace with real DB later
let counter = 1;

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ accounts });
  }
  else if (req.method === 'POST') {
    const { username, age, email, profile, price, mop, negotiable } = req.body;
    accounts.push({ id: counter++, username, age, email, profile, price, mop, negotiable });
    res.status(201).json({ message: 'Account added' });
  }
  else if (req.method === 'DELETE') {
    const { id } = req.body;
    accounts = accounts.filter(acc => acc.id !== id);
    res.status(200).json({ message: 'Deleted' });
  }
  else {
    res.status(405).end();
  }
}

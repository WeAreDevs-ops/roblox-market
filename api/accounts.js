let accounts = [];
let nextId = 1;

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ accounts });
  } else if (req.method === 'POST') {
    const { username, age, email, profileLink, imageUrl } = req.body;

    if (!username || !profileLink || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAccount = {
      id: nextId++,
      username,
      age,
      email,
      profileLink,
      imageUrl
    };

    accounts.push(newAccount);
    res.status(201).json(newAccount);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    accounts = accounts.filter(acc => acc.id !== id);
    res.status(200).json({ message: 'Deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// api/register.js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/sellers.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const sellers = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];

  if (sellers.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  sellers.push({ username, password, listings: [] });
  fs.writeFileSync(filePath, JSON.stringify(sellers, null, 2));
  res.status(201).json({ success: true });
}

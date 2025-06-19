// api/seller-listings.js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/sellers.json');

export default function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const username = Buffer.from(token, 'base64').toString();
  const sellers = JSON.parse(fs.readFileSync(filePath));

  const seller = sellers.find(u => u.username === username);
  if (!seller) return res.status(401).json({ error: 'Invalid token' });

  res.status(200).json({ listings: seller.listings });
}

// api/delete-listing.js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/sellers.json');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, listingId } = req.body;
  if (!token || !listingId) {
    return res.status(400).json({ error: 'Missing token or listing ID' });
  }

  const username = Buffer.from(token, 'base64').toString();
  const sellers = JSON.parse(fs.readFileSync(filePath));

  const seller = sellers.find(u => u.username === username);
  if (!seller) return res.status(401).json({ error: 'Invalid token' });

  seller.listings = seller.listings.filter(l => l.id !== listingId);
  fs.writeFileSync(filePath, JSON.stringify(sellers, null, 2));

  res.status(200).json({ success: true, message: 'Listing deleted' });
}

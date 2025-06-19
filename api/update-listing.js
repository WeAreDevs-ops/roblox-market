// api/update-listing.js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/sellers.json');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, listingId, updatedData } = req.body;
  if (!token || !listingId || !updatedData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const username = Buffer.from(token, 'base64').toString();
  const sellers = JSON.parse(fs.readFileSync(filePath));

  const seller = sellers.find(u => u.username === username);
  if (!seller) return res.status(401).json({ error: 'Invalid token' });

  const listing = seller.listings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  Object.assign(listing, updatedData);
  fs.writeFileSync(filePath, JSON.stringify(sellers, null, 2));
  res.status(200).json({ success: true, message: 'Listing updated' });
}

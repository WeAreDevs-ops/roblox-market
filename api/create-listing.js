import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, listing } = req.body;

  if (!username || !listing) return res.status(400).json({ error: 'Missing data' });

  try {
    const listingsRef = db.collection('listings');
    await listingsRef.add({ ...listing, username });

    res.status(200).json({ message: 'Listing created' });
  } catch (err) {
    console.error('Create Listing Error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
}

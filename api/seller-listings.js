import { db } from '../firebase-admin';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const listingsRef = db.collection('listings');
    const snapshot = await listingsRef.where('username', '==', username).get();

    const listings = [];
    snapshot.forEach(doc => {
      listings.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ listings });
  } catch (err) {
    console.error('Listings Error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
}

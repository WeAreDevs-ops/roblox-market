import { db } from '../firebase-admin';

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection('listings').get();
    const allListings = snapshot.docs.map(doc => doc.data());
    return res.status(200).json(allListings);
  } catch (err) {
    console.error('Fetch all listings error:', err);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
}

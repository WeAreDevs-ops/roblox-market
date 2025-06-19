import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sellerId, listingId } = req.body;

  if (!sellerId || !listingId) {
    return res.status(400).json({ error: 'Missing sellerId or listingId' });
  }

  try {
    const docRef = db.collection('sellers').doc(sellerId).collection('listings').doc(listingId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await docRef.delete();
    return res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

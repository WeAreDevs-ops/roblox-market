import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sellerId, listingId, updatedData } = req.body;

  if (!sellerId || !listingId || !updatedData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const docRef = db.collection('sellers').doc(sellerId).collection('listings').doc(listingId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await docRef.update(updatedData);
    return res.status(200).json({ message: 'Listing updated successfully' });
  } catch (err) {
    console.error('Error updating listing:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

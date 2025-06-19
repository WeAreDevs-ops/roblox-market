// api/seller-accounts.js
import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const snapshot = await db.collection('sellerAccounts').get();
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ accounts });
  } catch (error) {
    console.error('Error fetching seller accounts:', error);
    return res.status(500).json({ error: 'Failed to fetch seller accounts' });
  }
}

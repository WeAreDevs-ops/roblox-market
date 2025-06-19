import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const sellerRef = db.collection('sellers');
    const snapshot = await sellerRef.where('username', '==', username).get();

    if (!snapshot.empty) return res.status(400).json({ error: 'Username already exists' });

    await sellerRef.add({ username, password });

    return res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ error: 'Failed to register' });
  }
}

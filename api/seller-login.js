import { db } from '../../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const snapshot = await db.collection('sellers')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const doc = snapshot.docs[0];
    const seller = doc.data();

    if (seller.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    return res.status(200).json({
      id: doc.id,
      username: seller.username
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const db = admin.firestore();

    const snapshot = await db.collection('sellers').where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(400).json({ message: 'Seller not found' });
    }

    const sellerData = snapshot.docs[0].data();

    if (sellerData.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful', seller: { email: sellerData.email, username: sellerData.username } });
  } catch (error) {
    console.error('Error logging in seller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const db = admin.firestore();

    // Check if user already exists by email
    const snapshot = await db.collection('sellers').where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new seller
    await db.collection('sellers').add({
      email,
      username,
      password, // (Note: in production, hash this!)
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({ message: 'Seller registered successfully' });
  } catch (error) {
    console.error('Error registering seller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

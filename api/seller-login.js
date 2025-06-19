import { db } from '../firebase-admin.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const docRef = db.collection('sellers').doc(username);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    const seller = doc.data();

    // ✅ Check if hashed password exists
    if (!seller.passwordHash) {
      return res.status(500).json({ error: 'No password set for this user' });
    }

    const isMatch = await bcrypt.compare(password, seller.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Success
    return res.status(200).json({ message: 'Login successful', username });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

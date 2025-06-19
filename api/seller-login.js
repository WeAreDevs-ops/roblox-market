// /api/seller-login.js
import { db } from '../firebase-admin';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const userRef = db.collection('sellers').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { passwordHash } = userDoc.data();
    const isMatch = await bcrypt.compare(password, passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

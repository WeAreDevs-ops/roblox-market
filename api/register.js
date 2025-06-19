// /api/register.js
import { db } from '../firebase-admin';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const userRef = db.collection('sellers').doc(username);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await userRef.set({ username, passwordHash });

    return res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ error: 'Failed to register' });
  }
}

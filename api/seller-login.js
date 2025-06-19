// File: api/seller-login.js
import { db } from '../firebase-admin.js'; // Make sure to include .js extension
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const sellerRef = db.collection('sellers');
    const snapshot = await sellerRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Unauthorized: Username not found' });
    }

    const doc = snapshot.docs[0];
    const seller = doc.data();

    const isMatch = await bcrypt.compare(password, seller.hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    // Optional: include a token/session here later
    return res.status(200).json({ message: 'Login successful', sellerId: doc.id });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

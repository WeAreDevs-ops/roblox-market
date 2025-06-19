// api/seller-login.js
import { db } from '../firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const sellersRef = db.collection('sellers');
    const snapshot = await sellersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) return res.status(401).json({ error: 'Unauthorized - seller not found' });

    const doc = snapshot.docs[0];
    const seller = doc.data();

    if (seller.password !== password) {
      return res.status(401).json({ error: 'Unauthorized - wrong password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      sellerId: doc.id, // 🆔 used in SellerPanel
      name: seller.name,
      email: seller.email
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  }

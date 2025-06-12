import { dbAdmin } from '../firebaseadmin';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const sellerDoc = await dbAdmin.collection('sellers').doc(email).get();

    if (!sellerDoc.exists) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const sellerData = sellerDoc.data();
    const isMatch = await bcrypt.compare(password, sellerData.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Error logging in seller:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

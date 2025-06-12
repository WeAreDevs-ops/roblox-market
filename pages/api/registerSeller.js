import { dbAdmin } from '../firebaseadmin';
import { doc, setDoc } from 'firebase/firestore';
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
    const sellersRef = dbAdmin.collection('sellers');
    const docSnapshot = await sellersRef.doc(email).get();

    if (docSnapshot.exists) {
      return res.status(409).json({ message: 'Seller already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await setDoc(doc(sellersRef, email), {
      email,
      password: hashedPassword
    });

    return res.status(201).json({ message: 'Seller registered successfully.' });
  } catch (error) {
    console.error('Error registering seller:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

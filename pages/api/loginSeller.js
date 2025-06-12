import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    return res.status(200).json({ message: 'Seller found.', user });
  } catch (error) {
    return res.status(400).json({ message: 'Seller not found.' });
  }
}

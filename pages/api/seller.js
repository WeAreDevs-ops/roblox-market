import admin from '../../firebaseAdmin';

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    try {
      const sellersRef = db.collection('sellers');
      
      // Check if email already exists
      const querySnapshot = await sellersRef.where('email', '==', email).get();
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: 'Email already registered.' });
      }

      await sellersRef.add({
        username,
        email,
        password, // you can hash this if needed
        createdAt: new Date().toISOString()
      });

      res.status(200).json({ message: 'Seller registered successfully.' });
    } catch (error) {
      console.error('Error registering seller:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}

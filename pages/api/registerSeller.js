import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name, facebook, discord } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields.' });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const db = admin.firestore();

    await db.collection('sellers').doc(userRecord.uid).set({
      email,
      name,
      facebook,
      discord,
    });

    return res.status(200).json({ message: 'Seller registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registering seller.' });
  }
}

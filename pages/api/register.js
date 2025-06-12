import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name, facebook, discord } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save extra seller data in Firestore
    await admin.firestore().collection('sellers').doc(userRecord.uid).set({
      name,
      email,
      facebook,
      discord,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Seller registered successfully' });
  } catch (error) {
    console.error('Error registering seller:', error);
    res.status(500).json({ message: 'Failed to register seller', error: error.message });
  }
}

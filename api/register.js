import admin from '../../api/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name, facebook, discord } = req.body;

  try {
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Store additional data in Firestore
    await admin.firestore().collection('sellers').doc(userRecord.uid).set({
      name,
      facebook,
      discord,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'Seller registered successfully.' });
  } catch (error) {
    console.error('Error registering seller:', error);
    res.status(500).json({ message: 'Failed to register seller.', error: error.message });
  }
}

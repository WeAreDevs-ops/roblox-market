import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name, facebook, discord } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // You can also save facebook/discord to Firestore if you want later

    return res.status(200).json({ message: 'Seller registered successfully.', userId: userRecord.uid });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

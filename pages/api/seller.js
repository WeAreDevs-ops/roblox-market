import admin from './firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const users = await admin.auth().listUsers();
    const sellers = users.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    }));
    return res.status(200).json({ sellers });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

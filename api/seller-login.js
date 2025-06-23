import { auth } from '../firebase'; // Make sure this is the Firebase Client SDK
import { signInWithEmailAndPassword } from 'firebase/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const syntheticEmail = `${username}@rbxsm.com`; // Convert username to fake email

  try {
    await signInWithEmailAndPassword(auth, syntheticEmail, password);
    return res.status(200).json({ message: 'Login successful', username });
  } catch (err) {
    console.error('Firebase Auth Login Error:', err.message);
    return res.status(401).json({ error: 'Invalid username or password' });
  }
}

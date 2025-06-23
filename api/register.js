// /api/register.js
import { auth } from '../firebase'; // Firebase Client SDK
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const syntheticEmail = `${username}@rbxsm.com`; // Convert username to fake email

  try {
    await createUserWithEmailAndPassword(auth, syntheticEmail, password);
    return res.status(200).json({ message: 'Registration successful', username });
  } catch (err) {
    console.error('Firebase Auth Register Error:', err.message);
    let message = 'Failed to register';
    if (err.code === 'auth/email-already-in-use') {
      message = 'Username already exists';
    }
    return res.status(400).json({ error: message });
  }
        }

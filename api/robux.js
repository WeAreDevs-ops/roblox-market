import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const robuxRef = collection(db, 'robux');

  try {
    // 🔍 GET all robux listings
    if (req.method === 'GET') {
      const snapshot = await getDocs(robuxRef);
      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ accounts });
    }

    // ➕ POST a new robux listing
    if (req.method === 'POST') {
      const { robux, via, facebookLink, seller } = req.body;

      if (!robux || !via || !facebookLink || !seller) {
        return res.status(400).json({ error: 'Missing required field.' });
      }

      await addDoc(robuxRef, {
        robux,
        via,
        facebookLink,
        seller
      });

      return res.status(200).json({ message: 'Robux listing added' });
    }

    // ✏️ PUT to update a robux listing
    if (req.method === 'PUT') {
      const { id, robux, via, facebookLink, seller } = req.body;

      if (!id || !robux || !via || !facebookLink || !seller) {
        return res.status(400).json({ error: 'Missing required field.' });
      }

      const docRef = doc(db, 'robux', id);
      await updateDoc(docRef, { robux, via, facebookLink, seller });

      return res.status(200).json({ message: 'Robux listing updated' });
    }

    // ❌ DELETE a robux listing
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      const docRef = doc(db, 'robux', id);
      await deleteDoc(docRef);

      return res.status(200).json({ message: 'Robux listing deleted' });
    }

    // 🚫 Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Robux API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

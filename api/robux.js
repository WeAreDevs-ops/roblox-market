import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const robuxRef = collection(db, 'robuxListings');

  try {
    if (req.method === 'GET') {
      const snapshot = await getDocs(robuxRef);
      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ accounts });
    }

    if (req.method === 'POST') {
      const { username, facebookLink, via, robux, seller } = req.body;
      if (!username || !facebookLink || !via || !robux || !seller) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      const newDoc = await addDoc(robuxRef, { username, facebookLink, via, robux, seller });
      return res.status(201).json({ message: 'Listing added', id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const { id, username, facebookLink, via, robux, seller } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      const docRef = doc(db, 'robuxListings', id);
      await updateDoc(docRef, { username, facebookLink, via, robux, seller });
      return res.status(200).json({ message: 'Listing updated' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      const docRef = doc(db, 'robuxListings', id);
      await deleteDoc(docRef);
      return res.status(200).json({ message: 'Listing deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Firestore error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

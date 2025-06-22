import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default async function handler(req, res) {
  const robuxRef = collection(db, 'robuxListings');

  if (req.method === 'GET') {
    try {
      const snapshot = await getDocs(robuxRef);
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json({ accounts });
    } catch (error) {
      console.error('GET Error:', error);
      return res.status(500).json({ error: 'Failed to fetch robux listings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { robux, via, facebookLink, seller } = req.body;
      if (!robux || !via || !facebookLink || !seller) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      await addDoc(robuxRef, {
        robux,
        via,
        facebookLink,
        seller,
        createdAt: Date.now()
      });

      return res.status(200).json({ message: 'Robux listing added' });
    } catch (error) {
      console.error('POST Error:', error);
      return res.status(500).json({ error: 'Failed to add robux listing' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, robux, via, facebookLink, seller } = req.body;
      if (!id || !robux || !via || !facebookLink || !seller) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const listingRef = doc(db, 'robuxListings', id);
      await updateDoc(listingRef, { robux, via, facebookLink, seller });

      return res.status(200).json({ message: 'Robux listing updated' });
    } catch (error) {
      console.error('PUT Error:', error);
      return res.status(500).json({ error: 'Failed to update robux listing' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      const listingRef = doc(db, 'robuxListings', id);
      await deleteDoc(listingRef);

      return res.status(200).json({ message: 'Robux listing deleted' });
    } catch (error) {
      console.error('DELETE Error:', error);
      return res.status(500).json({ error: 'Failed to delete robux listing' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

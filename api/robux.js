import { db } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export default async function handler(req, res) {
  const robuxCollection = collection(db, 'robuxListings');

  try {
    // GET: Fetch all listings
    if (req.method === 'GET') {
      const snapshot = await getDocs(robuxCollection);
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json({ listings });
    }

    // POST: Add a new listing
    if (req.method === 'POST') {
      const { seller, amount, via, price, contact } = req.body;

      if (!seller || !amount || !via || !price || !contact) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      const newListing = {
        seller,
        amount,
        via,
        price,
        contact,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(robuxCollection, newListing);
      return res.status(201).json({ message: 'Listing added', id: docRef.id });
    }

    // PUT: Edit a listing (must include id and at least one field to update)
    if (req.method === 'PUT') {
      const { id, ...updateFields } = req.body;

      if (!id || Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Missing ID or update data.' });
      }

      const docRef = doc(db, 'robuxListings', id);
      await updateDoc(docRef, updateFields);

      return res.status(200).json({ message: 'Listing updated' });
    }

    // DELETE: Remove a listing by ID
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing ID.' });
      }

      const docRef = doc(db, 'robuxListings', id);
      await deleteDoc(docRef);

      return res.status(200).json({ message: 'Listing deleted' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('[robux.js API error]', error);
    return res.status(500).json({ error: 'Server Error' });
  }
          }

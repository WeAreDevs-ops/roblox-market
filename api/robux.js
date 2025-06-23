const { db } = require('../firebase'); // Adjust path if needed
const { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } = require('firebase/firestore');

export default async function handler(req, res) {
  const robuxCollection = collection(db, 'robux');

  try {
    if (req.method === 'GET') {
      const snapshot = await getDocs(robuxCollection);
      const robuxListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json({ robuxList: robuxListings });
    }

    if (req.method === 'POST') {
      const data = req.body;

      // Validate required fields exactly matching your Admin.jsx form data keys
      if (!data.price || !data.via || !data.robuxAmount || !data.facebookLink) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Add createdAt timestamp (optional)
      const newDoc = await addDoc(robuxCollection, {
        ...data,
        createdAt: Date.now(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing document ID' });
      }

      const docRef = doc(db, 'robux', id);
      await updateDoc(docRef, updateData);

      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing document ID' });
      }

      const docRef = doc(db, 'robux', id);
      await deleteDoc(docRef);

      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

import { db, admin } from '../firebase-admin';

export default async function handler(req, res) {
  const robuxRef = db.collection('robux');

  try {
    if (req.method === 'GET') {
      const snapshot = await robuxRef.get();
      const robuxList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ robuxList });
    }

    if (req.method === 'POST') {
      const { amount, via, price, contact, seller } = req.body;

      if (!amount || !via || !price || !contact || !seller) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDoc = await robuxRef.add({
        amount,
        via,
        price,
        contact,
        seller,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const { id, amount, via, price, contact, seller } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await robuxRef.doc(id).update({
        amount,
        via,
        price,
        contact,
        seller,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await robuxRef.doc(id).delete();
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Robux API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

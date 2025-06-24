const { db } = require('../firebase-admin');

export default async function handler(req, res) {
  const robuxCollection = db.collection('robux');

  try {
    if (req.method === 'GET') {
      const snapshot = await robuxCollection.get();
      const robuxListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ robuxList: robuxListings });
    }

    if (req.method === 'POST') {
      const { amount, via, price, contact, seller } = req.body;

      if (!amount || !via || !price || !contact || !seller) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDoc = await robuxCollection.add({
        amount,
        via,
        price,
        contact,
        seller,
        createdAt: Date.now(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const { id, amount, via, price, contact, seller } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      const docRef = robuxCollection.doc(id);
      await docRef.update({
        amount,
        via,
        price,
        contact,
        seller,
        updatedAt: Date.now(),
      });

      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      const docRef = robuxCollection.doc(id);
      await docRef.delete();

      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Robux API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

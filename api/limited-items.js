import { db, admin } from '../firebase-admin';

export default async function handler(req, res) {
  const limitedRef = db.collection('limited-items');

  try {
    if (req.method === 'GET') {
      const seller = req.headers.authorization;
      const snapshot = seller
        ? await limitedRef.where('seller', '==', seller).get()
        : await limitedRef.get();

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const {
        assetId,
        name,
        creator,
        thumbnail,
        itemType,
        originalPrice,
        price,
        contact,
        poisonStatus,
        seller,
      } = req.body;

      if (!assetId || !name || !creator || !price || !contact || !poisonStatus || !seller) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDoc = await limitedRef.add({
        assetId,
        name,
        creator,
        thumbnail,
        itemType,
        originalPrice: originalPrice || null,
        price,
        contact,
        poisonStatus,
        seller,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const {
        id,
        assetId,
        name,
        creator,
        thumbnail,
        itemType,
        originalPrice,
        price,
        contact,
        poisonStatus,
        seller,
      } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await limitedRef.doc(id).update({
        assetId,
        name,
        creator,
        thumbnail,
        itemType,
        originalPrice: originalPrice || null,
        price,
        contact,
        poisonStatus,
        seller,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await limitedRef.doc(id).delete();
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Limited Items API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

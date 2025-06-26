import { db, admin } from '../firebase-admin';

export default async function handler(req, res) {
  const limitedRef = db.collection('limitedItems');

  try {
    if (req.method === 'GET') {
      const snapshot = await limitedRef.get();
      const limitedList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ limitedList });
    }

    if (req.method === 'POST') {
      const {
        assetId,
        contactLink,
        seller,
        name,
        image,
        creator,
        type,
        resalePrice,
        resalePricePHP,
        isLimited,
        isLimitedUnique
      } = req.body;

      if (!assetId || !contactLink || !seller || !name || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDoc = await limitedRef.add({
        assetId,
        contactLink,
        seller,
        name,
        image,
        creator,
        type,
        resalePrice,
        resalePricePHP,
        isLimited,
        isLimitedUnique,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const {
        id,
        assetId,
        contactLink,
        seller,
        name,
        image,
        creator,
        type,
        resalePrice,
        resalePricePHP,
        isLimited,
        isLimitedUnique
      } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await limitedRef.doc(id).update({
        assetId,
        contactLink,
        seller,
        name,
        image,
        creator,
        type,
        resalePrice,
        resalePricePHP,
        isLimited,
        isLimitedUnique,
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
    console.error('Limited API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
        }

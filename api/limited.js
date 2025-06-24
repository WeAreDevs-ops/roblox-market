
import { db, admin } from '../firebase-admin';

export default async function handler(req, res) {
  const limitedsRef = db.collection('limiteds');

  try {
    if (req.method === 'GET') {
      const snapshot = await limitedsRef.get();
      const limitedsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ limitedsList });
    }

    if (req.method === 'POST') {
      const {
        assetId,
        itemName,
        creator,
        isLimited,
        isLimitedUnique,
        imageUrl,
        price,
        contactLink,
        sellerName
      } = req.body;

      if (!assetId || !itemName || !creator || !price || !contactLink || !sellerName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newDoc = await limitedsRef.add({
        assetId,
        itemName,
        creator,
        isLimited,
        isLimitedUnique,
        imageUrl,
        price,
        contactLink,
        sellerName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await limitedsRef.doc(id).update(updateData);

      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await limitedsRef.doc(id).delete();
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Limiteds API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
        }

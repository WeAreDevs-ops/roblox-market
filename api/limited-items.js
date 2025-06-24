// pages/api/limited-items.js
import { db } from '../../firebase-admin';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    try {
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
        seller
      } = req.body;

      if (!assetId || !name || !creator || !price || !contact || !poisonStatus) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newItem = {
        id: uuidv4(),
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
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'limited-items'), newItem);

      return res.status(200).json({ message: 'Limited item listed successfully' });
    } catch (error) {
      console.error('Failed to add limited item:', error);
      return res.status(500).json({ error: 'Failed to add limited item' });
    }
  }

  if (method === 'GET') {
    try {
      const sellerHeader = req.headers.authorization;
      const colRef = collection(db, 'limited-items');
      const q = sellerHeader
        ? query(colRef, where('seller', '==', sellerHeader))
        : colRef;

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => doc.data());

      return res.status(200).json({ items });
    } catch (error) {
      console.error('Failed to fetch limited items:', error);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
        }

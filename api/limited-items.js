import { db, admin } from '../firebase-admin';

export default async function handler(req, res) {
  const limitedRef = db.collection('limited-items');

  try {
    // === GET ALL LISTINGS ===
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

    // === CREATE NEW LISTING ===
    if (req.method === 'POST') {
      const { assetId, price, contact, poisonStatus } = req.body;
      const seller = req.headers.authorization;

      if (!assetId || !price || !contact || !poisonStatus || !seller) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Fetch item details from Roblox
      const robloxRes = await fetch(`https://economy.roblox.com/v1/assets/${assetId}/details`, {
        headers: {
          'User-Agent': 'RobloxMarketplaceBot/1.0'
        }
      });

      if (!robloxRes.ok) {
        console.error('Roblox API Error:', robloxRes.status);
        return res.status(400).json({ error: 'Failed to fetch asset info' });
      }

      const assetInfo = await robloxRes.json();

      const newDoc = await limitedRef.add({
        assetId,
        name: assetInfo.name || 'Unknown Item',
        creator: assetInfo.creator?.name || 'Unknown Creator',
        itemType: assetInfo.assetType || 'Unknown',
        originalPrice: assetInfo.priceInRobux ?? null,
        thumbnail: `https://www.roblox.com/asset-thumbnail/image?assetId=${assetId}&width=420&height=420&format=png`,
        price,
        contact,
        poisonStatus,
        seller,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: newDoc.id });
    }

    // === UPDATE LISTING ===
    if (req.method === 'PUT') {
      const { id, assetId, price, contact, poisonStatus } = req.body;
      const seller = req.headers.authorization;

      if (!id || !assetId || !price || !contact || !poisonStatus || !seller) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const robloxRes = await fetch(`https://economy.roblox.com/v1/assets/${assetId}/details`, {
        headers: {
          'User-Agent': 'RobloxMarketplaceBot/1.0'
        }
      });

      if (!robloxRes.ok) {
        console.error('Roblox API Error:', robloxRes.status);
        return res.status(400).json({ error: 'Failed to fetch asset info' });
      }

      const assetInfo = await robloxRes.json();

      await limitedRef.doc(id).update({
        assetId,
        name: assetInfo.name || 'Unknown Item',
        creator: assetInfo.creator?.name || 'Unknown Creator',
        itemType: assetInfo.assetType || 'Unknown',
        originalPrice: assetInfo.priceInRobux ?? null,
        thumbnail: `https://www.roblox.com/asset-thumbnail/image?assetId=${assetId}&width=420&height=420&format=png`,
        price,
        contact,
        poisonStatus,
        seller,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ message: 'Updated successfully' });
    }

    // === DELETE LISTING ===
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing document ID' });

      await limitedRef.doc(id).delete();
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    // === METHOD NOT ALLOWED ===
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('🔥 Limited Items API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
    }

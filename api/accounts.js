import { db, admin } from '../firebase-admin';
import axios from 'axios';

export default async function handler(req, res) {
  const accountsRef = db.collection('accounts');
  const counterRef = db.collection('meta').doc('salesCounter');

  const sellerUsername = req.headers.authorization || null;

  if (req.method === 'GET') {
    try {
      let snapshot;
      if (sellerUsername) {
        snapshot = await accountsRef.where("seller", "==", sellerUsername).get();
      } else {
        snapshot = await accountsRef.get();
      }

      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ accounts });
    } catch (error) {
      console.error("GET accounts error:", error);
      return res.status(500).json({ message: 'Failed to fetch accounts.' });
    }
  }

  if (req.method === 'POST') {
    const {
      username, email, price, mop,
      robuxBalance, limitedItems, inventory,
      accountType, gamepass, totalSummary, premium,
      seller
    } = req.body;

    if (sellerUsername && sellerUsername !== seller) {
      return res.status(403).json({ message: 'Unauthorized seller' });
    }

    let profile = "";
    let avatar = "";
    let ageInDays = null;

    try {
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, { headers: { "Content-Type": "application/json" } });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }

        const createdRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const createdDate = new Date(createdRes.data.created);
        const now = new Date();
        ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      }
    } catch (error) {
      console.error("Roblox API error:", error.message);
    }

    try {
      const existingSnap = await accountsRef.where("username", "==", username).get();
      if (!existingSnap.empty) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      await accountsRef.add({
        username, email, price, mop,
        robuxBalance, limitedItems, inventory,
        accountType, gamepass, totalSummary, premium,
        seller: sellerUsername || null,
        profile, avatar,
        age: ageInDays,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await counterRef.update({
        count: admin.firestore.FieldValue.increment(1)
      });

      return res.status(201).json({ message: 'Account added' });
    } catch (error) {
      console.error("POST account error:", error);
      return res.status(500).json({ message: 'Failed to add account' });
    }
  }

  if (req.method === 'PUT') {
    const { id, username, totalSummary, premium, seller, ...rest } = req.body;

    if (!id) return res.status(400).json({ message: 'Missing document ID' });

    if (sellerUsername && sellerUsername !== seller) {
      return res.status(403).json({ message: 'Unauthorized seller update' });
    }

    let profile = "";
    let avatar = "";

    try {
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, { headers: { "Content-Type": "application/json" } });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }
      }
    } catch (error) {
      console.error("Update Roblox info error:", error.message);
    }

    try {
      await accountsRef.doc(id).update({
        username,
        totalSummary,
        premium,
        ...rest,
        profile,
        avatar
      });
      return res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
      console.error("PUT account error:", error);
      return res.status(500).json({ message: 'Update failed' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing ID' });

    try {
      const docSnap = await accountsRef.doc(id).get();
      if (!docSnap.exists) return res.status(404).json({ message: 'Not found' });

      if (sellerUsername && docSnap.data().seller !== sellerUsername) {
        return res.status(403).json({ message: 'Unauthorized delete' });
      }

      await accountsRef.doc(id).delete();
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      console.error("DELETE account error:", err);
      return res.status(500).json({ message: 'Delete failed' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
  }

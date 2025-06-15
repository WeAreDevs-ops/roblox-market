import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from 'axios';

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ accounts });
  }

  else if (req.method === 'POST' || req.method === 'PUT') {
    const {
      id, username, totalSummary, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass
    } = req.body;

    let profile = "";
    let avatar = "";
    let premiumStatus = "Unknown";
    let rap = 0;
    let limitedValue = 0;

    try {
      // Get Roblox userId
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }

        // Fetch Rolimons unofficial API
        const roliRes = await axios.get(`https://rolimons-api.glitch.me/player/${username}`);
        const roliData = roliRes.data;

        if (roliData.success) {
          premiumStatus = roliData.premium ? "Premium" : "Non-Premium";
          rap = roliData.rap;
          limitedValue = roliData.value;
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox or Rolimons user info:", error.message);
    }

    const payload = {
      username, totalSummary, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass,
      profile, avatar, premiumStatus, rap, limitedValue
    };

    if (req.method === 'POST') {
      const docRef = await addDoc(accountsRef, payload);
      return res.status(201).json({ message: 'Account added', id: docRef.id });
    } else {
      if (!id) {
        return res.status(400).json({ message: 'Missing document ID' });
      }
      const docRef = doc(accountsRef, id);
      await updateDoc(docRef, payload);
      return res.status(200).json({ message: 'Updated successfully' });
    }
  }

  else if (req.method === 'DELETE') {
    const { id } = req.body;
    await deleteDoc(doc(accountsRef, id));
    return res.status(200).json({ message: 'Deleted' });
  }

  else {
    return res.status(405).end();
  }
}

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

  else if (req.method === 'POST') {
    const {
      username, totalSummary, email, price, mop, negotiable,
      robuxBalance, inventory, gamepass, accountType
    } = req.body;

    let profile = "";
    let avatar = "";
    let rap = 0;
    let value = 0;
    let limitedItems = 0;
    let accountAge = 0;

    try {
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

        // Call Rolimons API
        const rolimonsRes = await axios.get(`https://www.rolimons.com/playerapi/player/${userId}`);
        if (rolimonsRes.data?.success) {
          rap = rolimonsRes.data.player.rap || 0;
          value = rolimonsRes.data.player.value || 0;
          limitedItems = rolimonsRes.data.player.limited_count || 0;
        }

        // Get account age
        const userInfoRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        if (userInfoRes.data?.created) {
          const createdDate = new Date(userInfoRes.data.created);
          const today = new Date();
          const diffTime = Math.abs(today - createdDate);
          accountAge = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox or Rolimons user info:", error.message);
    }

    const docRef = await addDoc(accountsRef, {
      username, totalSummary, email, price, mop, negotiable,
      robuxBalance, inventory, gamepass, accountType,
      profile, avatar, rap, value, limitedItems, accountAge
    });

    return res.status(201).json({ message: 'Account added', id: docRef.id });
  }

  else if (req.method === 'PUT') {
    const { id, username, ...rest } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing document ID' });
    }

    let profile = "";
    let avatar = "";
    let rap = 0;
    let value = 0;
    let limitedItems = 0;
    let accountAge = 0;

    try {
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

        // Call Rolimons API
        const rolimonsRes = await axios.get(`https://www.rolimons.com/playerapi/player/${userId}`);
        if (rolimonsRes.data?.success) {
          rap = rolimonsRes.data.player.rap || 0;
          value = rolimonsRes.data.player.value || 0;
          limitedItems = rolimonsRes.data.player.limited_count || 0;
        }

        // Get account age
        const userInfoRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        if (userInfoRes.data?.created) {
          const createdDate = new Date(userInfoRes.data.created);
          const today = new Date();
          const diffTime = Math.abs(today - createdDate);
          accountAge = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox or Rolimons user info on update:", error.message);
    }

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, ...rest, profile, avatar, rap, value, limitedItems, accountAge
    });

    return res.status(200).json({ message: 'Updated successfully' });
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

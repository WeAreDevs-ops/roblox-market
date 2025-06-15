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
      username, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass
    } = req.body;

    let profile = "";
    let avatar = "";
    let age = "";  // Will auto calculate below

    try {
      // First get userId from username
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        // Get avatar
        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }

        // Get account creation date
        const userDetailsRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const createdDate = new Date(userDetailsRes.data.created);
        const today = new Date();
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        age = `${diffDays} Days`;  // Auto generated age format
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info:", error.message);
    }

    const docRef = await addDoc(accountsRef, {
      username, age, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass,
      profile, avatar
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
    let age = "";

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

        const userDetailsRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const createdDate = new Date(userDetailsRes.data.created);
        const today = new Date();
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        age = `${diffDays} Days`;
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info on update:", error.message);
    }

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, ...rest, profile, avatar, age
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

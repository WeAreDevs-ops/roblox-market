import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import axios from 'axios';

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ accounts });
  }
  else if (req.method === 'POST') {
    const { username, age, email, price, mop, negotiable, robuxBalance, limitedItems, inventory, games } = req.body;

    let profile = "";
    let avatar = "";

    try {
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        // Get avatar headshot
        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info:", error.message);
    }

    const docRef = await addDoc(accountsRef, { username, age, email, profile, avatar, price, mop, negotiable, robuxBalance, limitedItems, inventory, games });
    res.status(201).json({ message: 'Account added', id: docRef.id });
  }
  else if (req.method === 'DELETE') {
    const { id } = req.body;
    await deleteDoc(doc(accountsRef, id));
    res.status(200).json({ message: 'Deleted' });
  }
  else {
    res.status(405).end();
  }
      }

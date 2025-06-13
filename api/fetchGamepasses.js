import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from 'axios';

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ accounts });
  } 
  else if (req.method === 'POST') {
    const { username, age, email, price, mop, negotiable, robuxBalance, limitedItems, inventory, accountType } = req.body;

    let profile = "";
    let avatar = "";
    let games = {};

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

        // Internal API call to fetchGamepasses (auto-detect host)
        const host = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
        const gamepassRes = await axios.post(`${host}/api/fetchGamepasses`, { username });

        if (gamepassRes.data?.games) {
          games = gamepassRes.data.games;
        }
      }
    } catch (error) {
      console.error("❌ Roblox API error:", error.message);
    }

    const docRef = await addDoc(accountsRef, {
      username, age, email, profile, avatar, price, mop, negotiable, robuxBalance, limitedItems, inventory, games, accountType
    });

    res.status(201).json({ message: 'Account added', id: docRef.id });
  } 
  else if (req.method === 'DELETE') {
    const { id } = req.body;
    await deleteDoc(doc(accountsRef, id));
    res.status(200).json({ message: 'Deleted' });
  } 
  else if (req.method === 'PUT') {
    const { id, ...updatedData } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing document ID' });

    try {
      const docRef = doc(accountsRef, id);
      await updateDoc(docRef, updatedData);
      res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
      console.error("❌ Failed to update:", error.message);
      res.status(500).json({ message: 'Failed to update document' });
    }
  } 
  else {
    res.status(405).end();
  }
}

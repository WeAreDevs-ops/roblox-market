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

  // Shared function to fetch data from Rolimons
  async function fetchRolimonsData(username) {
    try {
      const response = await axios.get(`https://www.rolimons.com/playerapi/player?username=${username}`);
      const data = response.data;

      const userId = data.user_id;
      const profile = `https://www.roblox.com/users/${userId}/profile`;
      const avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

      const limitedItems = data.limited_count || 0;
      const rap = data.rap || 0;
      const premium = data.premium ? "Premium" : "Not Premium";

      return { userId, profile, avatar, limitedItems, rap, premium };
    } catch (error) {
      console.error("Rolimons API failed:", error.message);
      return { userId: null, profile: "", avatar: "", limitedItems: 0, rap: 0, premium: "Unknown" };
    }
  }

  else if (req.method === 'POST') {
    const {
      username, totalSummary, email, price, mop, negotiable,
      robuxBalance, inventory, gamepass, accountType
    } = req.body;

    const rolimonsData = await fetchRolimonsData(username);

    const docRef = await addDoc(accountsRef, {
      username, totalSummary, email, price, mop, negotiable,
      robuxBalance, limitedItems: rolimonsData.limitedItems,
      rap: rolimonsData.rap,
      premium: rolimonsData.premium,
      inventory, gamepass, accountType,
      profile: rolimonsData.profile,
      avatar: rolimonsData.avatar
    });

    return res.status(201).json({ message: 'Account added', id: docRef.id });
  }

  else if (req.method === 'PUT') {
    const { id, username, ...rest } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing document ID' });
    }

    const rolimonsData = await fetchRolimonsData(username);

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, ...rest,
      limitedItems: rolimonsData.limitedItems,
      rap: rolimonsData.rap,
      premium: rolimonsData.premium,
      profile: rolimonsData.profile,
      avatar: rolimonsData.avatar
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

import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, getDocs as getDocsQuery, increment, serverTimestamp } from "firebase/firestore";
import axios from 'axios';

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");
  const counterRef = doc(db, "meta", "salesCounter");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ accounts });
  }

  else if (req.method === 'POST') {
    const {
      username, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary, premium
    } = req.body;

    let profile = "";
    let avatar = "";
    let ageInDays = null;
    let hatsCount = 0;
    let hairCount = 0;
    let classicClothesCount = 0;

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

        const createdRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const createdDate = new Date(createdRes.data.created);
        const now = new Date();
        ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        const hatsRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/8?limit=1`);
        hatsCount = hatsRes.data.total;

        const hairRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/41?limit=1`);
        hairCount = hairRes.data.total;

        const shirtsRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/11?limit=1`);
        const pantsRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/12?limit=1`);
        const tshirtsRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/13?limit=1`);
        classicClothesCount = shirtsRes.data.total + pantsRes.data.total + tshirtsRes.data.total;
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info:", error.message);
    }

    try {
      const q = query(accountsRef, where("username", "==", username));
      const existingSnap = await getDocsQuery(q);
      if (!existingSnap.empty) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      await addDoc(accountsRef, {
        username, email, price, mop, negotiable,
        robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary, premium,
        profile, avatar, age: ageInDays,
        hatsCount, hairCount, classicClothesCount,
        createdAt: serverTimestamp()
      });

      await updateDoc(counterRef, { count: increment(1) });

      return res.status(201).json({ message: 'Account added' });
    } catch (error) {
      console.error("Error adding account:", error);
      return res.status(500).json({ message: 'Failed to add account' });
    }
  }

  else if (req.method === 'PUT') {
    const { id, username, totalSummary, premium, ...rest } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing document ID' });
    }

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

        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info on update:", error.message);
    }

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, totalSummary, premium, ...rest, profile, avatar
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

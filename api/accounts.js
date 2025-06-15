import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, getDocs as getDocsQuery } from "firebase/firestore";
import axios from 'axios';

// Utility to calculate age in days
function calculateAgeInDays(createdDateString) {
  const createdDate = new Date(createdDateString);
  const today = new Date();
  const diffTime = Math.abs(today - createdDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ accounts });
  }

  else if (req.method === 'POST') {
    const {
      username, age, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass, premium
    } = req.body;

    let profile = "";
    let avatar = "";
    let totalSummary = "";

    try {
      // Get userId from username
      const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
        usernames: [username]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (robloxRes.data?.data?.length > 0) {
        const userId = robloxRes.data.data[0].id;
        profile = `https://www.roblox.com/users/${userId}/profile`;

        // Get avatar image
        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (avatarRes.data?.data?.length > 0) {
          avatar = avatarRes.data.data[0].imageUrl;
        }

        // ✅ GET account created date
        const userInfo = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        if (userInfo.data?.created) {
          totalSummary = calculateAgeInDays(userInfo.data.created).toString();
        }
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

      const docRef = await addDoc(accountsRef, {
        username, age, email, price, mop, negotiable,
        robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary, premium,
        profile, avatar
      });

      return res.status(201).json({ message: 'Account added', id: docRef.id });
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
    let updatedTotalSummary = totalSummary;

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

        const userInfo = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        if (userInfo.data?.created) {
          updatedTotalSummary = calculateAgeInDays(userInfo.data.created).toString();
        }
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info on update:", error.message);
    }

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, totalSummary: updatedTotalSummary, premium, ...rest, profile, avatar
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

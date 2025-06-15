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
    try {
      const {
        id, username, totalSummary, email, price, mop, negotiable,
        robuxBalance, limitedItems, inventory, accountType, gamepass
      } = req.body;

      let profile = "";
      let avatar = "";
      let premiumStatus = "Unknown";
      let rap = 0;
      let limitedValue = 0;

      // Roblox Username to UserID + Avatar
      try {
        const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
          usernames: [username]
        }, {
          headers: { "Content-Type": "application/json" }
        });

        if (robloxRes.data?.data?.length > 0) {
          const userId = robloxRes.data.data[0].id;
          profile = `https://www.roblox.com/users/${userId}/profile`;

          // Avatar
          const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
          if (avatarRes.data?.data?.length > 0) {
            avatar = avatarRes.data.data[0].imageUrl;
          }

          // Premium Status
          const premiumRes = await axios.get(`https://premiumfeatures.roblox.com/v1/users/${userId}/validate-membership`);
          premiumStatus = premiumRes.data?.success ? "Premium" : "Not Premium";

          // Rolimons Limited/RAP
          try {
            const roliRes = await axios.get(`https://www.rolimons.com/playerapi/player/${userId}`);
            rap = roliRes.data?.player?.rap ?? 0;
            limitedValue = roliRes.data?.player?.value ?? 0;
          } catch (err) {
            console.error("Rolimons failed:", err.message);
          }
        }
      } catch (err) {
        console.error("Roblox API failed:", err.message);
      }

      // Final safe payload (no undefined)
      const safePayload = {
        username: username ?? "",
        totalSummary: totalSummary ?? "",
        email: email ?? "",
        price: price ?? 0,
        mop: mop ?? "",
        negotiable: negotiable ?? "",
        robuxBalance: robuxBalance ?? 0,
        limitedItems: limitedItems ?? 0,
        inventory: inventory ?? "",
        accountType: accountType ?? "",
        gamepass: gamepass ?? "",
        profile: profile ?? "",
        avatar: avatar ?? "",
        premiumStatus: premiumStatus ?? "Unknown",
        rap: rap ?? 0,
        limitedValue: limitedValue ?? 0
      };

      if (req.method === 'POST') {
        const docRef = await addDoc(accountsRef, safePayload);
        return res.status(201).json({ message: 'Account added', id: docRef.id });
      } else if (req.method === 'PUT') {
        if (!id) return res.status(400).json({ message: 'Missing document ID' });

        const docRef = doc(accountsRef, id);
        await updateDoc(docRef, safePayload);
        return res.status(200).json({ message: 'Updated successfully' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
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

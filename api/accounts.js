import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from 'axios';
import cheerio from 'cheerio';  // install cheerio to parse HTML

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
      robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary
    } = req.body;

    let profile = "";
    let avatar = "";
    let premium = false;  // <-- added

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

        // ✅ Premium detection via web scraping
        const htmlRes = await axios.get(`https://www.roblox.com/users/${userId}/profile`);
        const $ = cheerio.load(htmlRes.data);
        const premiumBadge = $('.badge-name-text:contains("Premium")');
        premium = premiumBadge.length > 0;
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info:", error.message);
    }

    const docRef = await addDoc(accountsRef, {
      username, age, email, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary,
      profile, avatar, premium  // <-- save premium to database
    });

    return res.status(201).json({ message: 'Account added', id: docRef.id });
  }

  else if (req.method === 'PUT') {
    const { id, username, totalSummary, ...rest } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing document ID' });
    }

    let profile = "";
    let avatar = "";
    let premium = false;

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

        const htmlRes = await axios.get(`https://www.roblox.com/users/${userId}/profile`);
        const $ = cheerio.load(htmlRes.data);
        const premiumBadge = $('.badge-name-text:contains("Premium")');
        premium = premiumBadge.length > 0;
      }
    } catch (error) {
      console.error("Failed to fetch Roblox user info on update:", error.message);
    }

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, {
      username, totalSummary, ...rest, profile, avatar, premium
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

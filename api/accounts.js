import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, getDocs as getDocsQuery, increment, serverTimestamp } from "firebase/firestore";
import axios from 'axios';
import cheerio from 'cheerio';  // ✅ install via npm i cheerio

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
    let hairsCount = 0;
    let classicCount = 0;

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

        // ✅ Try normal Roblox API first
        const hatsApi = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/8?limit=1`);
        const hairsApi = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/41?limit=1`);
        const shirtsApi = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/11?limit=1`);
        const pantsApi = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/12?limit=1`);

        hatsCount = hatsApi.data?.total || 0;
        hairsCount = hairsApi.data?.total || 0;
        const shirtsCount = shirtsApi.data?.total || 0;
        const pantsCount = pantsApi.data?.total || 0;
        classicCount = shirtsCount + pantsCount;

        // ✅ If any total = 0, fallback to web scraper
        if (hatsCount === 0 || hairsCount === 0 || classicCount === 0) {
          const inventoryPage = await axios.get(`https://www.roblox.com/users/${userId}/inventory`);
          const $ = cheerio.load(inventoryPage.data);

          // Extract counts from page meta tags (fallback method)
          const scriptText = $('script[type="application/ld+json"]').html();
          if (scriptText) {
            // Web fallback logic (optional, depending on Roblox page structure)
          }
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

      await addDoc(accountsRef, {
        username, email, price, mop, negotiable,
        robuxBalance, limitedItems, inventory, accountType, gamepass, totalSummary, premium,
        profile, avatar,
        age: ageInDays,
        hatsCount, hairsCount, classicCount,
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

    const docRef = doc(accountsRef, id);
    await updateDoc(docRef, { username, totalSummary, premium, ...rest });
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

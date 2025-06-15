import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { cookie, price, mop, negotiable } = req.body;

    try {
      const userInfo = await getUserInfo(cookie);
      if (!userInfo) {
        return res.status(400).json({ error: 'Failed to fetch user info' });
      }

      const isPremium = await fetchPremiumStatus(cookie);

      const docRef = await addDoc(collection(db, 'accounts'), {
        username: userInfo.name,
        userId: userInfo.id,
        robux: userInfo.robux,
        age: userInfo.age,
        emailVerified: userInfo.emailVerified,
        premium: isPremium,
        price,
        mop,
        negotiable,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error('Error saving account:', error);
      res.status(500).json({ error: 'Failed to save account' });
    }
  } else if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, 'accounts'));
      const accounts = [];
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUserInfo(cookie) {
  try {
    const response = await axios.get('https://users.roblox.com/v1/users/authenticated', {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const user = response.data;

    const robuxResponse = await axios.get('https://economy.roblox.com/v1/users/' + user.id + '/currency', {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const robux = robuxResponse.data.robux;

    const emailResponse = await axios.get('https://accountinformation.roblox.com/v1/email', {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const emailVerified = emailResponse.data.verified;

    const age = calculateAge(user.birthdate);

    return { name: user.name, id: user.id, robux, emailVerified, age };
  } catch (error) {
    console.error('Failed to fetch Roblox user info:', error.message);
    return null;
  }
}

async function fetchPremiumStatus(cookie) {
  try {
    const response = await axios.get('https://www.roblox.com/my/money.aspx', {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const premiumText = $('span:contains("Premium")').text();
    const isPremium = premiumText.includes('Premium');
    return isPremium;
  } catch (error) {
    console.error('Failed to fetch premium status:', error.message);
    return false;
  }
}

function calculateAge(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

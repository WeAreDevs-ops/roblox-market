import axios from 'axios';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function GET(request) {
  try {
    const accountsCollection = collection(db, 'accounts');
    const snapshot = await getDocs(accountsCollection);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(accounts), { status: 200 });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new Response('Error fetching accounts', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { cookie, price, mop, nego } = await request.json();

    // Get User ID
    const idRes = await axios.get('https://users.roblox.com/v1/users/authenticated', {
      headers: { Cookie: `.ROBLOSECURITY=${cookie}` }
    });

    const userId = idRes.data.id;
    const username = idRes.data.name;

    // Get RAP
    const inventoryRes = await axios.get(`https://economy.roblox.com/v1/users/${userId}/inventory/${2}`, {
      headers: { Cookie: `.ROBLOSECURITY=${cookie}` }
    });

    let rap = 0;
    if (inventoryRes.data && inventoryRes.data.data) {
      rap = inventoryRes.data.data.reduce((acc, item) => acc + (item.recentAveragePrice || 0), 0);
    }

    // Get Premium
    const premiumRes = await axios.get(`https://premiumfeatures.roblox.com/v1/users/${userId}/subscriptions`, {
      headers: { Cookie: `.ROBLOSECURITY=${cookie}` }
    });

    const premium = premiumRes.data && premiumRes.data.length > 0 ? "Yes" : "No";

    const data = {
      cookie,
      username,
      rap,
      premium,
      price,
      mop,
      nego
    };

    await addDoc(collection(db, 'accounts'), data);
    return new Response('Account added successfully', { status: 201 });

  } catch (error) {
    console.error('Error saving account:', error);
    return new Response('Error saving account', { status: 500 });
  }
}

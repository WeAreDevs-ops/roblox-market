import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // First: Get UserId from Username
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    });

    const userData = await userRes.json();
    if (!userData || !userData.data || userData.data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userData.data[0].id;

    // Second: Fetch Gamepasses by UserId
    const gamepassRes = await fetch(`https://inventory.roblox.com/v1/users/${userId}/assets/999999999`);
    const gamepassData = await gamepassRes.json();

    if (!gamepassData || !gamepassData.data) {
      return res.status(404).json({ error: 'No gamepasses found' });
    }

    const games = {};

    for (const item of gamepassData.data) {
      // Fetch product info
      const productRes = await fetch(`https://api.roblox.com/marketplace/productinfo?assetId=${item.assetId}`);
      const productData = await productRes.json();

      const gameName = productData?.Creator?.Name || 'Unknown';
      games[gameName] = (games[gameName] || 0) + 1;
    }

    res.status(200).json({ gamepasses: games });
  } catch (error) {
    console.error('Fetch Gamepasses Error:', error);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

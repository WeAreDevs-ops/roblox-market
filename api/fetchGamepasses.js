import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    const userRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userRes.data?.data?.length) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userId = userRes.data.data[0].id;
    const gamepassesRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory?assetTypes=GamePass&limit=100`);

    const gamepasses = {};
    for (const asset of gamepassesRes.data.data || []) {
      gamepasses[asset.name] = (gamepasses[asset.name] || 0) + 1;
    }

    res.status(200).json({ gamepasses });
  } catch (error) {
    console.error("❌ Failed fetching gamepasses:", error.message);
    res.status(500).json({ message: 'Error fetching gamepasses' });
  }
}

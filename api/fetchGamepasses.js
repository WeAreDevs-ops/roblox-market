import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Missing username' });
  }

  try {
    // Step 1: Get UserId from Username (via Roproxy)
    const userRes = await axios.post('https://users.roproxy.com/v1/usernames/users', {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Step 2: Use Roblox official inventory API directly (for GamePass: assetTypeId=34)
    const inventoryRes = await axios.get(`https://inventory.roblox.com/v2/users/${userId}/inventory/34`);
    const items = inventoryRes.data?.data || [];

    if (items.length === 0) {
      return res.status(200).json({ games: {} });
    }

    const gameCounts = {};

    // Process gamepasses
    const fetchGameDetails = async (assetId) => {
      try {
        const gamepassRes = await axios.get(`https://games.roproxy.com/v1/game-passes/${assetId}`);
        const placeId = gamepassRes.data?.associatedPlaceId;

        if (!placeId) return;

        const placeRes = await axios.get(`https://games.roproxy.com/v1/games?universeIds=${placeId}`);
        const gameName = placeRes.data?.data?.[0]?.name || "Unknown";

        gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
      } catch (err) {
        console.error(`Error fetching for assetId ${assetId}:`, err.message);
      }
    };

    for (const item of items) {
      await fetchGameDetails(item.assetId);
    }

    return res.status(200).json({ games: gameCounts });
  } catch (error) {
    console.error("❌ Roblox API error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

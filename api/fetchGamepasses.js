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
    // Step 1: Get UserId from Username
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Step 2: Get all gamepasses owned by user using Roproxy
    const inventoryRes = await axios.get(`https://inventory.roproxy.com/v2/users/${userId}/inventory?assetTypes=34`);

    const items = inventoryRes.data?.data || [];

    if (items.length === 0) {
      return res.status(200).json({ games: {} });
    }

    // Step 3: Process gamepasses
    const gameCounts = {};

    // Limit concurrent requests (to avoid hitting rate limit)
    const fetchGameDetails = async (assetId) => {
      try {
        const gamepassRes = await axios.get(`https://games.roproxy.com/v1/game-passes/${assetId}`);
        const placeId = gamepassRes.data?.associatedPlaceId;

        if (!placeId) return;

        const placeRes = await axios.get(`https://games.roproxy.com/v1/games?universeIds=${placeId}`);
        const gameName = placeRes.data?.data?.[0]?.name || "Unknown";

        if (gameCounts[gameName]) {
          gameCounts[gameName]++;
        } else {
          gameCounts[gameName] = 1;
        }
      } catch (err) {
        console.error(`Error fetching for assetId ${assetId}:`, err.message);
      }
    };

    // Await all gamepass requests with concurrency limit
    const concurrencyLimit = 5;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < items.length; i += concurrencyLimit) {
      const batch = items.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map(item => fetchGameDetails(item.assetId)));
      await delay(500); // small delay to avoid being ratelimited
    }

    return res.status(200).json({ games: gameCounts });
  } catch (error) {
    console.error("❌ Roblox API error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

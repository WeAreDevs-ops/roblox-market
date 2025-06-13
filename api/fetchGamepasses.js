import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // Get userId from username
    const userRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Define both endpoints
    const robloxAPI = `https://inventory.roblox.com/v1/users/${userId}/assets/34`;
    const roproxyAPI = `https://inventory.roproxy.com/v1/users/${userId}/assets/34`;

    let gamepasses = [];

    try {
      const response = await axios.get(robloxAPI);
      gamepasses = response.data.data;
      console.log("✅ Used real Roblox API");
    } catch (err) {
      console.warn("⚠️ Roblox API failed, switching to Roproxy...");
      try {
        const fallbackRes = await axios.get(roproxyAPI);
        gamepasses = fallbackRes.data.data;
        console.log("✅ Used Roproxy API");
      } catch (fallbackErr) {
        console.error("❌ Both APIs failed", fallbackErr.message);
        return res.status(500).json({ message: 'Failed fetching gamepasses from both sources' });
      }
    }

    // Group gamepasses by game (productId = game id)
    const gameCounts = {};
    gamepasses.forEach(item => {
      const placeId = item.assetId;
      if (!gameCounts[placeId]) {
        gameCounts[placeId] = 1;
      } else {
        gameCounts[placeId]++;
      }
    });

    const result = {};

    // Now get place name from placeId using Roproxy
    for (const placeId of Object.keys(gameCounts)) {
      try {
        const placeInfo = await axios.get(`https://games.roproxy.com/v1/games?universeIds=${placeId}`);
        const name = placeInfo?.data?.data?.[0]?.name || `Game ID: ${placeId}`;
        result[name] = gameCounts[placeId];
      } catch (err) {
        console.warn(`⚠️ Failed getting game name for ${placeId}, using ID`);
        result[`Game ID: ${placeId}`] = gameCounts[placeId];
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Roblox API error:", error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
  }

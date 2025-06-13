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
    // Get userId from username
    const userIdRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userIdRes.data?.data?.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userIdRes.data.data[0].id;

    // Get owned gamepasses (AssetTypeId: 34)
    const gamepassesRes = await axios.get(`https://inventory.roproxy.com/v1/users/${userId}/assets/34`);
    const gamepasses = gamepassesRes.data.data;

    if (!gamepasses.length) {
      return res.status(200).json({ games: {} });  // no gamepasses
    }

    // Group gamepasses by game (optional: advanced mapping if you want)
    const games = {};

    for (const pass of gamepasses) {
      const gamepassId = pass.id;

      // Get game info for each gamepass (gameId)
      try {
        const gamepassInfo = await axios.get(`https://apis.roproxy.com/game-passes/v1/game-passes/${gamepassId}`);
        const gameId = gamepassInfo.data?.associatedPlaceId || "Unknown";

        // Get game name
        const gameInfo = await axios.get(`https://games.roblox.com/v1/games?universeIds=${gameId}`);
        const gameName = gameInfo.data?.data?.[0]?.name || "Unknown Game";

        if (games[gameName]) {
          games[gameName]++;
        } else {
          games[gameName] = 1;
        }
      } catch (err) {
        console.warn(`Failed fetching game info for gamepass ${gamepassId}`);
      }
    }

    res.status(200).json({ games });

  } catch (error) {
    console.error("Roblox API error:", error.message);
    res.status(500).json({ message: 'Failed to fetch gamepasses' });
  }
}

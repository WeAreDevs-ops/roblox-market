import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Missing username in request' });
  }

  try {
    // Step 1: Get UserId from Username via RoProxy
    const userRes = await axios.get(`https://users.roproxy.com/v1/usernames/users?usernames[0]=${username}`);
    const userData = userRes.data.data[0];
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found on Roblox' });
    }

    const userId = userData.id;

    // Step 2: Fetch Owned Gamepasses from RoProxy
    let gamepasses = {};
    let cursor = null;
    let page = 1;

    do {
      const url = `https://games.roproxy.com/v2/users/${userId}/games?limit=50&sortOrder=Asc${cursor ? `&cursor=${cursor}` : ''}`;
      const gamesRes = await axios.get(url);
      const gamesData = gamesRes.data;

      for (const game of gamesData.data) {
        const gameId = game.id;
        const gameName = game.name;

        // Now for each game, check owned gamepasses:
        const gpUrl = `https://economy.roproxy.com/v2/assets/${gameId}/details`; // We cannot use this directly for gamepasses
        const gpRes = await axios.get(`https://games.roproxy.com/v1/games/${gameId}/game-passes?limit=50`);
        
        const passes = gpRes.data.data.filter(gp => gp.seller && gp.seller.id === userId);

        if (passes.length > 0) {
          gamepasses[gameName] = passes.length;
        }
      }

      cursor = gamesData.nextPageCursor;
      page++;
    } while (cursor);

    // If no gamepasses found
    if (Object.keys(gamepasses).length === 0) {
      gamepasses = { 'No Gamepass Found': 0 };
    }

    res.status(200).json({ games: gamepasses });
  } catch (error) {
    console.error("❌ Final API error:", error.message);
    res.status(500).json({ error: 'Failed fetching gamepasses' });
  }
}

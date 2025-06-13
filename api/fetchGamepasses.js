import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // First: Get User ID by Username
    const userIdRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!userIdRes.data?.data?.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userIdRes.data.data[0].id;

    // Second: Get Gamepasses directly
    let gamepasses = [];
    try {
      const response = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=All&limit=50`);
      const games = response.data.data || [];

      for (const game of games) {
        const gamepassRes = await axios.get(`https://www.roproxy.com/v1/games/${game.id}/game-passes`);
        const passes = gamepassRes.data?.data || [];

        if (passes.length > 0) {
          gamepasses.push({
            name: game.name,
            count: passes.length
          });
        }
      }
    } catch (error) {
      console.error("Fallback failed:", error.message);
    }

    // Handle empty gamepasses
    const gamesObject = {};
    if (gamepasses.length > 0) {
      for (const g of gamepasses) {
        gamesObject[g.name] = g.count;
      }
    }

    return res.status(200).json({ games: gamesObject });
  } catch (error) {
    console.error('❌ Roblox API error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

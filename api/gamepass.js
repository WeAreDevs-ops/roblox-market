import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const response = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`);
    const games = response.data.data || [];

    const gamepassResults = [];

    for (const game of games) {
      const gamepasses = await axios.get(`https://inventory.roblox.com/v1/assets/${game.id}/game-passes`);
      gamepassResults.push({
        gameName: game.name,
        gamePasses: gamepasses.data || []
      });
    }

    return res.status(200).json({ success: true, data: gamepassResults });
  } catch (error) {
    console.error('Error fetching gamepasses:', error);
    return res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

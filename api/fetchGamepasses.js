import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    // Correct request to fetch userId by username (POST not GET)
    const userRes = await axios.post(`https://users.roproxy.com/v1/usernames/users`, 
      { usernames: [username] }, 
      { headers: { "Content-Type": "application/json" } }
    );

    if (userRes.data.data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Get recently played games
    const recentRes = await axios.get(`https://games.roproxy.com/v2/users/${userId}/recently-played`);
    const games = {};

    for (const game of recentRes.data.data) {
      try {
        // For each game, get gamepasses
        const gamepassRes = await axios.get(`https://avatar.roproxy.com/v1/users/${userId}/game-passes?placeId=${game.placeId}`);

        const count = gamepassRes.data.data.length;
        if (count > 0) {
          games[game.name] = count;
        }
      } catch (innerErr) {
        console.log(`Failed fetching gamepasses for game ${game.name}: ${innerErr.message}`);
      }
    }

    res.status(200).json({ games });

  } catch (err) {
    console.error('Roblox API error:', err.message);
    res.status(500).json({ error: 'Failed fetching gamepasses' });
  }
}

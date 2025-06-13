import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    // Fetch user ID from username
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Fetch games owned by the user
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=100`);
    const games = gamesRes.data?.data || [];

    const gamepassCounts = [];

    for (const game of games) {
      try {
        const passesRes = await axios.get(`https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`);
        const passes = passesRes.data?.data || [];

        if (passes.length > 0) {
          gamepassCounts.push(`${game.name} (${passes.length})`);
        }
      } catch (err) {
        console.error(`Error fetching passes for game ${game.id}:`, err.message);
      }
    }

    return res.status(200).json({ gamepasses: gamepassCounts });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

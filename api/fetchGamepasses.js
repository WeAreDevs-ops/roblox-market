import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    // Get User ID
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.data.data[0].id;

    // Fetch all gamepasses directly
    const passesRes = await axios.get(`https://catalog.roblox.com/v1/search/items?CreatorType=User&CreatorTargetId=${userId}&Category=GamePasses&Limit=100`);
    const passes = passesRes.data?.data || [];

    if (passes.length === 0) {
      return res.status(200).json({ gamepasses: [] });
    }

    // Group gamepasses by game name
    const gameCounts = {};

    passes.forEach(pass => {
      const gameName = pass.name.split(" ")[0] || "Unknown"; // crude extract
      if (gameCounts[gameName]) {
        gameCounts[gameName]++;
      } else {
        gameCounts[gameName] = 1;
      }
    });

    const result = Object.entries(gameCounts).map(([game, count]) => `${game} (${count})`);

    return res.status(200).json({ gamepasses: result });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

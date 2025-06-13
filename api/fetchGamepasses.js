import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Invalid username provided." });
  }

  try {
    const userRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username],
      excludeBannedUsers: false
    });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.data.data[0].id;
    const gamepassesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=100`);
    const games = gamepassesRes.data?.data || [];

    const result = {};

    for (const game of games) {
      const passesRes = await axios.get(`https://www.roblox.com/api/game-passes/${game.id}/game-passes`);
      const passes = passesRes.data?.data || [];
      if (passes.length > 0) {
        result[game.name] = passes.length;
      }
    }

    res.status(200).json({ gamepasses: result });
  } catch (error) {
    console.error('Failed fetching gamepasses:', error.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

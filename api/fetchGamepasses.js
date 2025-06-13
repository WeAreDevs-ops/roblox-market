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
    // First get the UserId
    const userIdRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userIdRes.data || userIdRes.data.data.length === 0) {
      return res.status(404).json({ error: "Username not found" });
    }

    const userId = userIdRes.data.data[0].id;

    // Then get the user's owned games
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=50`);
    const games = gamesRes.data.data;

    let gamepasses = {};

    for (const game of games) {
      try {
        const passesRes = await axios.get(`https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=100`);
        const passes = passesRes.data.data;
        gamepasses[game.name] = passes.length;
      } catch (innerErr) {
        console.error(`Failed fetching gamepasses for game ${game.id}: ${innerErr.message}`);
        gamepasses[game.name] = 0;
      }
    }

    res.status(200).json({ gamepasses });
  } catch (error) {
    console.error("❌ Failed fetching gamepasses:", error.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

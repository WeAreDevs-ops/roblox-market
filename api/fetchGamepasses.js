import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    // Get UserId
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    }, { headers: { 'Content-Type': 'application/json' } });

    const data = userRes.data;
    if (!data || data.data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = data.data[0].id;

    // Fetch Gamepasses
    const invRes = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/34?limit=100`);
    const passes = invRes.data.data;

    // Group by Game
    const gameCount = {};

    for (const pass of passes) {
      // Fetch game info for each gamepass
      const gamepassDetails = await axios.get(`https://www.roblox.com/game-pass/${pass.id}`);
      const regex = /data-universe-id="(\d+)"/;
      const match = gamepassDetails.data.match(regex);
      
      if (match) {
        const universeId = match[1];

        // Fetch universe info to get game name
        const gameInfo = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        const name = gameInfo.data.data[0].name;

        if (gameCount[name]) {
          gameCount[name]++;
        } else {
          gameCount[name] = 1;
        }
      }
    }

    const result = Object.entries(gameCount).map(([game, count]) => `${game} (${count})`);
    res.json({ gamepasses: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching gamepasses' });
  }
}

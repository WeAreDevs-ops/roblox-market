// myproject/api/fetchGamepasses.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Only POST allowed'});
  const { username } = req.body;
  if (!username) return res.status(400).json({error:'username required'});

  try {
    // 1. Get userId
    const users = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      {usernames: [username]},
      {headers: {'Content-Type':'application/json'}}
    );
    const u = users.data?.data?.[0];
    if (!u) return res.status(404).json({error:'User not found'});
    const uid = u.id;

    // 2. Get user's games
    const gamesRes = await axios.get(
      `https://games.roproxy.com/v2/users/${uid}/games?accessFilter=2&limit=50&sortOrder=Asc`
    );
    const games = gamesRes.data?.data || [];

    // 3. For each game, fetch gamepasses
    const results = {};
    for (let g of games) {
      const gpRes = await axios.get(
        `https://games.roproxy.com/v1/games/${g.id}/game-passes?limit=100&sortOrder=Asc`
      );
      const passes = gpRes.data?.data;
      if (passes?.length) results[g.name] = passes.length;
      // small delay optional
    }

    return res.status(200).json({ gamepasses: results });
  } catch (err) {
    console.error(err);
    const code = err.response?.status || 500;
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    return res.status(code).json({ error: msg });
  }
}

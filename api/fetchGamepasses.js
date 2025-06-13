import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username } = req.body;

  try {
    const robloxRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!robloxRes.data?.data?.length) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userId = robloxRes.data.data[0].id;

    // Primary API using real Roblox API
    const gamepassesRes = await axios.get(`https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=100&pageNumber=1&userId=${userId}`);

    const gamepasses = gamepassesRes.data?.Data || [];
    const games = {};

    for (const pass of gamepasses) {
      const gameId = pass.AssetId;
      const gameInfo = await axios.get(`https://games.roblox.com/v1/games?universeIds=${gameId}`).catch(() => null);
      const gameName = gameInfo?.data?.data?.[0]?.name || 'Unknown';

      if (!games[gameName]) games[gameName] = 1;
      else games[gameName]++;
    }

    res.status(200).json({ games });
  } catch (err) {
    console.error('❌ Failed fetching gamepasses:', err.message);
    res.status(500).json({ message: 'Error fetching gamepasses' });
  }
}

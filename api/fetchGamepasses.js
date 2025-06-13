export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Convert username to userId
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });

    const userData = await userRes.json();
    if (!userData?.data?.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userData.data[0].id;

    let games = {};
    let nextPageCursor = null;

    do {
      const universeRes = await fetch(`https://develop.roblox.com/v1/users/${userId}/universes?limit=50${nextPageCursor ? `&cursor=${nextPageCursor}` : ''}`);
      const universeData = await universeRes.json();

      if (!universeData.data.length) {
        console.log("No universes found for user:", username);
        break;
      }

      for (const universe of universeData.data) {
        const universeId = universe.id;
        let gamepassCursor = null;
        let totalGamepasses = 0;

        do {
          const gamepassRes = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes?universeId=${universeId}&limit=100${gamepassCursor ? `&cursor=${gamepassCursor}` : ''}`);
          const gamepassData = await gamepassRes.json();

          if (!gamepassData.data.length) {
            break; // No gamepasses in this universe
          }

          totalGamepasses += gamepassData.data.length;
          gamepassCursor = gamepassData.nextPageCursor;
        } while (gamepassCursor);

        if (totalGamepasses > 0) {
          games[universe.name] = totalGamepasses;
        }
      }

      nextPageCursor = universeData.nextPageCursor;
    } while (nextPageCursor);

    if (Object.keys(games).length === 0) {
      return res.status(404).json({ error: 'No Gamepasses Found' });
    }

    return res.status(200).json({ gamepasses: games });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

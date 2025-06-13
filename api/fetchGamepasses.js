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
    let allGamepasses = [];
    let cursor = null;

    // Fetch all gamepasses (handle pagination)
    do {
      const response = await axios.get(
        `https://inventory.roblox.com/v1/users/${userId}/assets/34?limit=100&cursor=${cursor || ''}`
      );

      allGamepasses = allGamepasses.concat(response.data.data);
      cursor = response.data.nextPageCursor;
    } while (cursor);

    if (allGamepasses.length === 0) {
      return res.status(200).json({ games: {} });
    }

    // Map universeId to count
    const universeCountMap = {};

    // Collect all universeIds
    const universeIds = allGamepasses.map(item => item.assetId);

    // Fetch product info to get universeIds
    const productInfoResponse = await axios.post(
      'https://apis.roblox.com/marketplace-items/v1/items/details',
      { itemIds: universeIds },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Now map universeIds to count
    productInfoResponse.data.data.forEach(item => {
      const universeId = item.creatorTargetId;

      if (!universeId) return;

      if (universeCountMap[universeId]) {
        universeCountMap[universeId]++;
      } else {
        universeCountMap[universeId] = 1;
      }
    });

    // Now fetch game names for these universeIds
    const universeIdList = Object.keys(universeCountMap);
    const gameNameMap = {};

    // Roblox API only accepts max 100 universeIds per request
    const chunkArray = (arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };

    const universeChunks = chunkArray(universeIdList, 100);

    for (const chunk of universeChunks) {
      const gamesResponse = await axios.get(
        `https://games.roblox.com/v1/games?universeIds=${chunk.join(',')}`
      );

      gamesResponse.data.data.forEach(game => {
        gameNameMap[game.id] = game.name;
      });
    }

    // Final formatted result: { gameName: count }
    const result = {};

    Object.entries(universeCountMap).forEach(([universeId, count]) => {
      const gameName = gameNameMap[universeId] || 'Unknown Game';
      if (result[gameName]) {
        result[gameName] += count;
      } else {
        result[gameName] = count;
      }
    });

    return res.status(200).json({ games: result });
  } catch (error) {
    console.error('Error fetching gamepasses:', error);
    return res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
}

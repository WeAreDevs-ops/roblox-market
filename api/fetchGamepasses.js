import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // Get UserID from username
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const userData = userRes.data.data[0];
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = userData.id;

    // Now fetch all Gamepasses using AssetTypeId 34
    let gamepassCount = 0;
    let nextPageCursor = null;

    do {
      const inventoryRes = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/34?limit=100${nextPageCursor ? `&cursor=${nextPageCursor}` : ''}`);
      const { data } = inventoryRes;
      gamepassCount += data.data.length;
      nextPageCursor = data.nextPageCursor;
    } while (nextPageCursor);

    return res.status(200).json({ totalGamepasses: gamepassCount });
  } catch (err) {
    console.error('Failed fetching Gamepasses:', err.message);
    return res.status(500).json({ message: 'Failed to fetch gamepasses' });
  }
}

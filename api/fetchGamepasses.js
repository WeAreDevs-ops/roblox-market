import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    // Step 1: Get UserId by username
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const data = userRes.data;
    if (!data || data.data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = data.data[0].id;

    // Step 2: Fetch Gamepasses
    const passesRes = await axios.get(`https://www.roblox.com/users/${userId}/game-pass`);
    const html = passesRes.data;

    // Use regex to extract gamepasses names from HTML page
    const matches = [...html.matchAll(/<span class="text-overflow game-pass-name" title="([^"]+)">/g)];
    const gamepasses = matches.map(match => match[1]);

    if (gamepasses.length === 0) {
      return res.json({ gamepasses: ['No Gamepasses Found'] });
    }

    res.json({ gamepasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching gamepasses' });
  }
                                      }

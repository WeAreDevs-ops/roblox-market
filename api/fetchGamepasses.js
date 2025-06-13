import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // 1️⃣ Get UserID from Username
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    });

    const userData = userRes.data?.data?.[0];
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userData.id;

    // 2️⃣ Get all universeIds owned by user
    let universes = [];
    let nextPageCursor = null;

    do {
      const universeRes = await axios.get(`https://develop.roblox.com/v1/universes?creatorType=User&creatorTargetId=${userId}&limit=50${nextPageCursor ? `&cursor=${nextPageCursor}` : ''}`);
      universes = universes.concat(universeRes.data.data);
      nextPageCursor = universeRes.data.nextPageCursor;
    } while (nextPageCursor);

    if (universes.length === 0) {
      return res.status(200).json({ gamepasses: {} });
    }

    // 3️⃣ Loop through universes and collect placeIds
    const gamepassesResult = {};

    for (const universe of universes) {
      const universeId = universe.id;
      const gameName = universe.name;

      // 4️⃣ Get places under this universe
      const placeRes = await axios.get(`https://develop.roblox.com/v1/universes/${universeId}/places?limit=50`);
      const places = placeRes.data.data;

      for (const place of places) {
        const placeId = place.id;

        // 5️⃣ Fetch gamepasses for each placeId
        let gamepasses = [];
        let gamepassCursor = null;

        do {
          const gamepassRes = await axios.get(`https://www.roblox.com/places/${placeId}/game-passes?cursor=${gamepassCursor || ''}`);
          const html = gamepassRes.data;

          // 6️⃣ Extract gamepasses via RegEx (because Roblox doesn't have clean API for this anymore)
          const regex = /data-pass-id="(\d+)"[\s\S]*?class="text-name">([^<]+)<\/div>/g;
          let match;
          while ((match = regex.exec(html)) !== null) {
            gamepasses.push({
              id: match[1],
              name: match[2]
            });
          }

          // Roblox does not have cursor for web page, so we break
          gamepassCursor = null;
        } while (gamepassCursor);

        if (gamepasses.length > 0) {
          gamepassesResult[gameName] = (gamepassesResult[gameName] || 0) + gamepasses.length;
        }
      }
    }

    return res.status(200).json({ gamepasses: gamepassesResult });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
      }

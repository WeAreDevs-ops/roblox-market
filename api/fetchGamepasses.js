import axios from 'axios';

const GAMES_TO_CHECK = [
  { name: "Blox Fruits", universeId: 2753915549 },
  { name: "Pet Simulator X", universeId: 6284583030 },
  { name: "Adopt Me!", universeId: 920587237 },
  { name: "BedWars", universeId: 6872265039 },
  { name: "DOORS", universeId: 6516141723 },
  { name: "Brookhaven 🏡RP", universeId: 4924922222 },
  { name: "Murder Mystery 2", universeId: 142823291 },
  { name: "Arsenal", universeId: 111958650 },
  { name: "Bee Swarm Simulator", universeId: 1537690962 }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    // Resolve username to userId
    const userRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username]
    }, { headers: { "Content-Type": "application/json" } });

    if (!userRes.data?.data?.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = userRes.data.data[0].id;
    const ownedGames = {};

    for (const game of GAMES_TO_CHECK) {
      try {
        const gamepassesRes = await axios.get(`https://games.roblox.com/v1/games/${game.universeId}/game-passes`);
        const gamepasses = gamepassesRes.data?.data || [];

        let ownedCount = 0;

        for (const gamepass of gamepasses) {
          try {
            const ownershipRes = await axios.get(`https://api.roblox.com/GamePasses/${gamepass.id}/IsOwned?userId=${userId}`);
            if (ownershipRes.data?.Owned) {
              ownedCount++;
            }
          } catch (innerErr) {
            console.error(`Failed checking ownership for gamepass ${gamepass.id}:`, innerErr.message);
          }
        }

        if (ownedCount > 0) {
          ownedGames[game.name] = ownedCount;
        }

      } catch (gameErr) {
        console.error(`Failed fetching gamepasses for ${game.name}:`, gameErr.message);
      }
    }

    res.status(200).json({ games: ownedGames });
  } catch (error) {
    console.error("Main API error:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

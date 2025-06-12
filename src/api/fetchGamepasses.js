import axios from 'axios';

export async function fetchGamepassesByUsername(username) {
  try {
    // Step 1: Convert username to userId
    const userIdRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username],
      excludeBannedUsers: false
    }, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" // Added user-agent
      }
    });

    if (!userIdRes.data?.data?.length) {
      console.error("User not found");
      return [];
    }

    const userId = userIdRes.data.data[0].id;

    // Step 2: Fetch games (Gamepasses owned by user)
    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" // Added user-agent
        }
      }
    );

    const games = gamesRes.data?.data?.map(game => game.name);
    return games?.filter(g => g) || [];
  } catch (err) {
    console.error("Error fetching gamepasses:", err?.response?.data || err.message);
    return [];
  }
}

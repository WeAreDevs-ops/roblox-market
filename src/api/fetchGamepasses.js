import axios from 'axios';

export async function fetchGamepassesByUsername(username) {
  try {
    // Step 1: Convert username to userId
    const userIdRes = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!userIdRes.data?.data?.length) {
      console.error("User not found");
      return ["User not found"];
    }

    const userId = userIdRes.data.data[0].id;

    // Step 2: Use Roblox Games API to fetch owned games
    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?limit=10`
    );

    const games = gamesRes.data?.data || [];

    if (games.length === 0) {
      return ["No Gamepasses Found"];
    }

    // Step 3: Return the list of game names
    const gameNames = games.map(game => game.name);
    return gameNames;

  } catch (err) {
    console.error("Error fetching gamepasses:", err?.response?.data || err.message);
    return ["Error Fetching"];
  }
}

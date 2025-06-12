import axios from 'axios';

// Main function to get Gamepasses based on username
export async function fetchGamepassesByUsername(username) {
  try {
    // Step 1 — Convert Username to UserID
    const usernameRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username],
      excludeBannedUsers: false
    });

    if (!usernameRes.data.data.length) {
      console.error("Username not found.");
      return [];
    }

    const userId = usernameRes.data.data[0].id;

    // Step 2 — Fetch Gamepasses using UserID
    const gamepassRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=10&sortOrder=Asc`);

    const gamepasses = gamepassRes.data.data.map(game => game.name);
    return gamepasses;
  } catch (error) {
    console.error("Error fetching gamepasses:", error);
    return [];
  }
}

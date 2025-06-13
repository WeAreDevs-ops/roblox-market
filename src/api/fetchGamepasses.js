import axios from 'axios';

export async function fetchGamepassesByUsername(username) {
  try {
    // Convert username to userId
    const userIdRes = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      }
    );

    if (!userIdRes.data?.data?.length) {
      console.error("User not found");
      return ["User not found"];
    }

    const userId = userIdRes.data.data[0].id;

    // Fetch gamepasses with proper headers
    const gamepassesRes = await axios.get(
      `https://catalog.roblox.com/v1/search/items/details?Category=GamePass&CreatorTargetId=${userId}&Limit=30`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        }
      }
    );

    const passes = gamepassesRes.data?.data || [];
    const gamepassNames = passes.map(pass => pass.name);

    return gamepassNames.length > 0 ? gamepassNames : ["No Gamepasses"];
  } catch (err) {
    console.error("Error fetching gamepasses:", err?.response?.data || err.message);
    return ["Error Fetching"];
  }
}

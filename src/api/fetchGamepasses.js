import axios from 'axios';

export async function fetchGamepassesByUsername(username) {
  try {
    // Get userId from username
    const userIdRes = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [username],
      excludeBannedUsers: false
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (!userIdRes.data?.data?.length) {
      console.error("User not found");
      return [];
    }

    const userId = userIdRes.data.data[0].id;

    // Fetch gamepasses owned by this user
    const gamepassesRes = await axios.get(
      `https://catalog.roblox.com/v1/search/items/details?Category=GamePass&CreatorTargetId=${userId}&Limit=30`
    );

    const passes = gamepassesRes.data?.data || [];

    const gamepassNames = passes.map(pass => pass.name);

    return gamepassNames.length > 0 ? gamepassNames : ["No Gamepasses"];
  } catch (err) {
    console.error("Error fetching gamepasses:", err?.response?.data || err.message);
    return ["Error Fetching"];
  }
}

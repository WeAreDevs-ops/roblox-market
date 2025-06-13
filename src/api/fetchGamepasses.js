import axios from 'axios';

export async function fetchGamepassesByUsername(username) {
  try {
    // Step 1: Get User ID from username
    const userIdRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false
    });

    const userIdData = userIdRes.data;
    if (!userIdData?.data?.length) {
      console.error('User not found');
      return [];
    }

    const userId = userIdData.data[0].id;

    // Step 2: Get Gamepasses using User ID
    const gamepassRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=10&sortOrder=Asc`);
    const games = gamepassRes.data?.data || [];

    // Step 3: Extract Game Names
    const gameNames = games.map(game => game.name);

    return gameNames;
  } catch (error) {
    console.error('Error fetching gamepasses:', error?.response?.data || error.message);
    return [];
  }
}

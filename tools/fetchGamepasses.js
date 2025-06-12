const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

// Helper function for input prompt
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function fetchGamepasses() {
  try {
    const roblosecurity = await askQuestion('.ROBLOSECURITY cookie: ');
    const userId = await askQuestion('Your Roblox User ID: ');

    const headers = {
      'Cookie': `.ROBLOSECURITY=${roblosecurity}`,
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    };

    let gamepasses = [];
    let cursor = "";

    console.log('\nFetching gamepasses...');

    while (true) {
      const url = `https://games.roblox.com/v2/users/${userId}/games?limit=50&sortOrder=Asc&cursor=${cursor}`;
      const res = await axios.get(url, { headers });

      for (const game of res.data.data) {
        const gamepassUrl = `https://www.roblox.com/game-pass/${game.id}`;
        gamepasses.push(`${game.name} (${gamepassUrl})`);
      }

      if (res.data.nextPageCursor) {
        cursor = res.data.nextPageCursor;
      } else {
        break;
      }
    }

    console.log(`\n✅ Total gamepasses found: ${gamepasses.length}`);

    // Save to file
    fs.writeFileSync('gamepasses.json', JSON.stringify(gamepasses, null, 2));
    console.log('\n✅ Gamepasses saved to gamepasses.json');

  } catch (err) {
    console.error('❌ Error fetching gamepasses:', err.response?.data || err.message);
  }
}

fetchGamepasses();

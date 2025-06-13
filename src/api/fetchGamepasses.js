export async function fetchGamepassesByUsername(username) {
  try {
    const res = await fetch('/api/fetchGamepasses', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username})
    });
    const data = await res.json();
    return res.ok ? data.gamepasses || {} : {};
  } catch {
    return {};
  }
}

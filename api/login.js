export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;

    const ADMIN_PASSWORD = 'supersecret'; // <-- Hardcoded password here

    if (password === ADMIN_PASSWORD) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

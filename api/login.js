export default function handler(req, res) {
  const ADMIN_PASSWORD = 'supersecret';  // change this password

  if (req.method === 'POST') {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.status(200).json({ message: 'Logged in' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    res.status(405).end();
  }
}

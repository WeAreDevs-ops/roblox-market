import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'sellers.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    let sellers = [];
    if (fs.existsSync(filePath)) {
      sellers = JSON.parse(fs.readFileSync(filePath));
    }

    const seller = sellers.find(s => s.email === email && s.password === password);

    if (!seller) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({ message: 'Login successful', seller });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

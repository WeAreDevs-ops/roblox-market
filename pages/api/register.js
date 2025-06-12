import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'sellers.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name, facebook, discord } = req.body;

    let sellers = [];
    if (fs.existsSync(filePath)) {
      sellers = JSON.parse(fs.readFileSync(filePath));
    }

    if (sellers.find(s => s.email === email)) {
      return res.status(400).json({ message: 'Seller already exists.' });
    }

    sellers.push({ email, password, name, facebook, discord });

    fs.writeFileSync(filePath, JSON.stringify(sellers));
    res.status(200).json({ message: 'Seller registered successfully.' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

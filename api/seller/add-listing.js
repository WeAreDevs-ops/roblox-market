import fs from 'fs';
import path from 'path';

const accountsPath = path.join(process.cwd(), 'data', 'accounts.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sellerEmail, accountData } = req.body;

    let accounts = [];
    if (fs.existsSync(accountsPath)) {
      accounts = JSON.parse(fs.readFileSync(accountsPath));
    }

    accountData.sellerEmail = sellerEmail;
    accountData.id = Date.now();
    accounts.push(accountData);

    fs.writeFileSync(accountsPath, JSON.stringify(accounts));
    res.status(200).json({ message: 'Account added successfully.' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

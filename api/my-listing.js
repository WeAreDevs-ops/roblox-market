import fs from 'fs';
import path from 'path';

const accountsPath = path.join(process.cwd(), 'data', 'accounts.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sellerEmail } = req.body;

    if (!sellerEmail) {
      return res.status(400).json({ message: 'Seller email is required.' });
    }

    let accounts = [];
    if (fs.existsSync(accountsPath)) {
      accounts = JSON.parse(fs.readFileSync(accountsPath));
    }

    const sellerAccounts = accounts.filter(acc => acc.sellerEmail === sellerEmail);
    res.status(200).json({ accounts: sellerAccounts });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

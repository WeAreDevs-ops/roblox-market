const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to your JSON file
const dataFile = path.join(__dirname, '../data/accounts.json');

// Load accounts from file
function loadAccounts() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
  }
  const data = fs.readFileSync(dataFile);
  return JSON.parse(data);
}

// Save accounts to file
function saveAccounts(accounts) {
  fs.writeFileSync(dataFile, JSON.stringify(accounts, null, 2));
}

// GET all accounts
router.get('/', (req, res) => {
  const accounts = loadAccounts();
  res.json({ accounts });
});

// ADD new account
router.post('/', (req, res) => {
  const accounts = loadAccounts();
  const newAccount = {
    id: Date.now().toString(),
    username: req.body.username || '',
    age: req.body.age || '',
    email: req.body.email || '',
    profile: req.body.profile || '',
    price: req.body.price || '',
    mop: req.body.mop || '',
    negotiable: req.body.negotiable || '',
    robuxBalance: req.body.robuxBalance || '',
    limitedItems: req.body.limitedItems || '',
    inventory: req.body.inventory || '',
    games: req.body.games || []
  };
  accounts.push(newAccount);
  saveAccounts(accounts);
  res.json({ message: 'Account added.' });
});

// DELETE account
router.delete('/', (req, res) => {
  const accounts = loadAccounts();
  const updatedAccounts = accounts.filter(acc => acc.id !== req.body.id);
  saveAccounts(updatedAccounts);
  res.json({ message: 'Account deleted.' });
});

module.exports = router;

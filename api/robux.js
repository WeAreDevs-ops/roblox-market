export default function handler(req, res) {
  const robuxSellers = [
    {
      id: '1',
      robux: '500',
      username: 'RobuxSeller123',
      facebookLink: 'https://facebook.com/robuxseller123',
      via: 'Group Payout'
    },
    {
      id: '2',
      robux: '1000',
      username: 'RichRobuxGuy',
      facebookLink: 'https://facebook.com/richrobuxguy',
      via: 'Gamepass Link'
    },
    {
      id: '3',
      robux: '750',
      username: 'DailyRobuxDrop',
      facebookLink: 'https://facebook.com/dailyrobuxdrop',
      via: 'Shirt'
    }
  ];

  if (req.method === 'GET') {
    return res.status(200).json({ accounts: robuxSellers });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

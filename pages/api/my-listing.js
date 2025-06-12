export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Simulated data
  return res.status(200).json({
    listings: [
      { id: 1, title: 'Sample Item', price: 10 },
      { id: 2, title: 'Second Item', price: 20 },
    ]
  });
}

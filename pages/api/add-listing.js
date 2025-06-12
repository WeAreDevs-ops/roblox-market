export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { title, description, price } = req.body;

  // For now, just simulate saving
  return res.status(200).json({ message: 'Listing added successfully.' });
}

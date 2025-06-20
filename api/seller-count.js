// /api/seller-count.js
import { db } from '../firebase'; // adjust path if needed
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  try {
    const sellerSnapshot = await getDocs(collection(db, "sellers"));
    const count = sellerSnapshot.size;

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting sellers:", error);
    res.status(500).json({ error: "Failed to count sellers" });
  }
}

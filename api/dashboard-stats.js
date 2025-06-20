import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    // Get all accounts
    const accountsSnapshot = await getDocs(collection(db, "accounts"));
    const accounts = accountsSnapshot.docs.map(doc => doc.data());

    const totalAccounts = accounts.length;
    const totalRevenue = accounts.reduce((sum, acc) => sum + (parseFloat(acc.price) || 0), 0);

    // Get today's new stock (optional, for daily stock count)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newStock = accounts.filter(acc => {
      const createdAt = acc.createdAt?.toDate?.();
      return createdAt && createdAt >= today;
    }).length;

    // Count total sellers from sellers collection
    const sellersSnapshot = await getDocs(collection(db, "sellers"));
    const sellerCount = sellersSnapshot.size;

    res.status(200).json({
      totalAccounts,
      totalRevenue,
      newStock,
      sellerCount // replaced salesCount
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}

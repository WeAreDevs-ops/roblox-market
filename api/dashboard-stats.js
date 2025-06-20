import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";

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

    // Count unique sellers
    const sellerSet = new Set();
    accounts.forEach(acc => {
      if (acc.seller) sellerSet.add(acc.seller);
    });
    const sellerCount = sellerSet.size;

    res.status(200).json({
      totalAccounts,
      totalRevenue,
      newStock,
      sellerCount
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}

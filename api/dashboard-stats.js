import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");
  const counterRef = doc(db, "meta", "salesCounter");

  try {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Total Revenue
    const totalRevenue = accounts.reduce((sum, acc) => sum + (parseFloat(acc.price) || 0), 0);

    // Daily new stock
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newStock = accounts.filter(acc => acc.createdAt?.toDate() >= today).length;

    // Sales Counter
    const counterSnap = await getDoc(counterRef);
    const salesCount = counterSnap.exists() ? counterSnap.data().count : 0;

    return res.status(200).json({
      totalAccounts: accounts.length,
      totalRevenue,
      newStock,
      salesCount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }
}

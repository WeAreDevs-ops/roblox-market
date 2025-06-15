import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    // 1️⃣ Total accounts count
    const accountsRef = collection(db, "accounts");
    const accountsSnapshot = await getDocs(accountsRef);
    const totalAccounts = accountsSnapshot.size;

    // 2️⃣ Total revenue calculation
    let totalRevenue = 0;
    accountsSnapshot.forEach(doc => {
      const data = doc.data();
      const price = parseFloat(data.price) || 0;
      totalRevenue += price;
    });

    // 3️⃣ Live sales counter (from salesCounter doc)
    const salesCounterRef = doc(db, "meta", "salesCounter");
    const salesCounterSnap = await getDoc(salesCounterRef);
    const liveSales = salesCounterSnap.exists() ? salesCounterSnap.data().count : 0;

    res.status(200).json({
      totalAccounts,
      totalRevenue,
      liveSales
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
}

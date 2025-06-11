import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default async function handler(req, res) {
  const accountsRef = collection(db, "accounts");

  if (req.method === 'GET') {
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ accounts });
  }
  else if (req.method === 'POST') {
    const {
      username, age, email, profile, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, games
    } = req.body;

    const docRef = await addDoc(accountsRef, {
      username, age, email, profile, price, mop, negotiable,
      robuxBalance, limitedItems, inventory, games
    });
    res.status(201).json({ message: 'Account added', id: docRef.id });
  }
  else if (req.method === 'DELETE') {
    const { id } = req.body;
    await deleteDoc(doc(accountsRef, id));
    res.status(200).json({ message: 'Deleted' });
  }
  else {
    res.status(405).end();
  }
}

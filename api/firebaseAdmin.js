import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),  // This will work locally if you have GOOGLE_APPLICATION_CREDENTIALS set
    projectId: "rbx-sm-db",           // Your exact project ID from firebaseConfig
  });
}

const db = getFirestore();

export default db;

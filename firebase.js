import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA51M53loHrRKuHboShHvSQJXKtkgp698E",
  authDomain: "rbxmarket-6a8b8.firebaseapp.com",
  projectId: "rbxmarket-6a8b8",
  storageBucket: "rbxmarket-6a8b8.appspot.com",
  messagingSenderId: "426561154224",
  appId: "1:426561154224:web:fef73c5b5f9c3dbc3e5f75"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

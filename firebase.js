import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  // ✅ Import auth module

const firebaseConfig = {
  apiKey: "AIzaSyDCfx4m9yrc6CaEU83q_AbG_RG4agOvje4",
  authDomain: "rbx-sm-db.firebaseapp.com",
  projectId: "rbx-sm-db",
  storageBucket: "rbx-sm-db.appspot.com",
  messagingSenderId: "626499721050",
  appId: "1:626499721050:web:237fd4bf9cb9abd4228563",
  measurementId: "G-M878D082KB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // ✅ Initialize auth

export { db, auth, app };  // ✅ Export auth & app too for AuthContext.jsx

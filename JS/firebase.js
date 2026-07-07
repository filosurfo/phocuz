// PHO CUZ — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6Yh15hdO_PWoPanPcuCwzV8PDnslLqoE",
  authDomain: "phocuz.firebaseapp.com",
  projectId: "phocuz",
  storageBucket: "phocuz.firebasestorage.app",
  messagingSenderId: "241068135242",
  appId: "1:241068135242:web:93341c5ee0bcbcb5a3e7b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

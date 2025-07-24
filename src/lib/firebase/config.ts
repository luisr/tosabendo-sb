// src/lib/firebase/config.ts

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDfPCReZ39M45dX9lsZ-921UYmBzTdKZ6M",
  authDomain: "to-sabendo-dc78e.firebaseapp.com",
  projectId: "to-sabendo-dc78e",
  storageBucket: "to-sabendo-dc78e.firebasestorage.app",
  messagingSenderId: "904192137845",
  appId: "1:904192137845:web:b837386e595a9e5c53763c",
  measurementId: "G-BDTML3DVFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

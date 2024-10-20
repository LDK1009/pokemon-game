// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "pokemon-game-9bb08.firebaseapp.com",
  projectId: "pokemon-game-9bb08",
  storageBucket: "pokemon-game-9bb08.appspot.com",
  messagingSenderId: "1020593454192",
  appId: "1:1020593454192:web:1f3f2ffcd32eb8d14ac8b5",
  measurementId: "G-V5XZ9577K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore 인스턴스 가져오기


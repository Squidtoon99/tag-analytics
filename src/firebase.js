// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: import.meta.env.VITE_API_KEY,

  authDomain: "tag-analytics-2eb35.firebaseapp.com",

  projectId: "tag-analytics-2eb35",

  storageBucket: "tag-analytics-2eb35.appspot.com",

  messagingSenderId: "1052139784770",

  appId: "1:1052139784770:web:4f658a6c9ad499c4567bdb",

  measurementId: "G-LNYJ2KZB01"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// if (import.meta.env.MODE == "development") {
//   connectFirestoreEmulator(firestore, 'localhost', 8084);
// }

export const provider = new GoogleAuthProvider();
export const functions = getFunctions(app);

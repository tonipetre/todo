// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXjiagJX5lsvKrdsL1HMH4cgKGEyXsseQ",
  authDomain: "todo-app-233c3.firebaseapp.com",
  projectId: "todo-app-233c3",
  storageBucket: "todo-app-233c3.appspot.com",
  messagingSenderId: "870574359099",
  appId: "1:870574359099:web:ef57fe28091097763b921e",
  measurementId: "G-S2HGHHKBCM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// export { db, auth };

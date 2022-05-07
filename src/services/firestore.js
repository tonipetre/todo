import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default {
  listenToUpdates: (user, snapshot, error) => {
    const refCollecton = collection(db, "todos");
    const q = query(
      refCollecton,
      where("author", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, snapshot, error);
  },

  createDocument: async (value, user) => {
    if (value) {
      const refCollecton = collection(db, "todos");
      let document;
      try {
        document = await addDoc(refCollecton, {
          author: user.uid,
          text: value,
          checked: false,
          createdAt: serverTimestamp(),
          updatedAt: null,
        });
        console.log(`Your todo was create at ${document.path}`);
      } catch (err) {
        console.log(err);
      }

      const newDocument = {
        id: document.id,
        author: user.uid,
        text: value,
        checked: false,
        createdAt: serverTimestamp(),
        updatedAt: null,
      };

      return { newDocument };
    }
  },

  updateDocument: async (documentId, updatedContent) => {
    const docUpdate = {
      text: updatedContent.text,
      checked: updatedContent.checked,
      updatedAt: serverTimestamp(),
    };
    const docRef = doc(db, "todos", documentId);
    await updateDoc(docRef, docUpdate);
  },

  deleteDocument: async (documentId) => {
    const docRef = doc(db, "todos", documentId);
    const deletedDocument = await deleteDoc(docRef);

    return { deletedDocument };
  },
};

import { db } from "../utils/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  limit,
  orderBy,
  Timestamp,
  serverTimestamp,
  startAfter,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { COLLECTION_REF } from "./Constants";

export default {
  listenToUpdates: async function (user) {
    // if (user) {
    //   const q = query(
    //     collection(COLLECTION_REF),
    //     where("author", "==", user.uid),
    //     orderBy("createdAt", "desc")
    //   );
    //   let todos;
    //   const listenToUpdatesUnsubscribe = onSnapshot(q, (querySnapshot) => {
    //     if (querySnapshot.exists()) {
    //       console.log(querySnapshot.data());
    //       const docData = querySnapshot.data();
    //       console.log(JSON.stringify(docData));
    //       todos = docData.docs.map((doc) => {
    //         return {
    //           id: doc.id,
    //           ...doc.data(),
    //         };
    //       });
    //     }
    //   });
    //   return { listenToUpdatesUnsubscribe, todos };
    // }
    // const q = query(collection(db, "todos"));
    // let todos = [];
    // let listenToUpdatesUnsubscribe = onSnapshot(q, (querySnapshot) => {
    //   const data = querySnapshot.docs.map((doc) => {
    //     return {
    //       id: doc.id,
    //       ...doc.data(),
    //     };
    //   });
    // });
    // console.log("todos", todos);
    // return { todos };
  },
  getFirstBatch: async function (user) {
    console.log(user);
    if (user) {
      try {
        const q = query(
          COLLECTION_REF,
          where("author", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        const data = await getDocs(q);

        const lastDocument = data.docs[data.docs.length - 1];

        const todos = data.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        return { todos, lastDocument };
      } catch (error) {
        console.log(error);
      }
    }
  },

  getNextBatch: async (lastDocumentKey, user) => {
    try {
      const q = query(
        COLLECTION_REF,
        where("author", "==", user.uid),
        orderBy("createdAt", "desc"),
        startAfter(lastDocumentKey),
        limit(2)
      );
      const data = await getDocs(q);

      const lastDocument = data.docs[data.docs.length - 1];
      const todos = data.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      return { todos, lastDocument };
    } catch (error) {
      console.log(error);
    }
  },

  // documentID: EtbWbeb2BTbACSpzCLK
  getOneDocument: async (documentId) => {
    const docRef = doc(db, "todos", documentId);
    const mySnapshot = await getDoc(docRef);
    if (mySnapshot.exists()) {
      const docData = mySnapshot.data();
      return { docData };
    }
  },

  createDocument: async (value, user) => {
    if (value) {
      let document;
      try {
        document = await addDoc(COLLECTION_REF, {
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

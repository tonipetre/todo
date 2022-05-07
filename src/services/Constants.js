import { collection } from "firebase/firestore";
import { db } from "../utils/firebase";

export const COLLECTION_REF = collection(db, "todos");

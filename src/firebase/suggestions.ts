import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'suggestions';

export interface Suggestion {
  id: string;
  countryCode: string;
  countryName: string;
  caseTitle: string;
  submittedAt: any;
}

export async function submitSuggestion(data: {
  countryCode: string;
  countryName: string;
  caseTitle: string;
}): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    submittedAt: serverTimestamp(),
  });
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const q = query(collection(db, COLLECTION), orderBy('submittedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Suggestion[];
}

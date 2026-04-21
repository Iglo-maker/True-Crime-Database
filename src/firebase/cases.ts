import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Case } from '../types';

const COLLECTION = 'cases';

export async function getCases(countryCode: string, stateCode: string): Promise<Case[]> {
  const q = query(
    collection(db, COLLECTION),
    where('countryCode', '==', countryCode),
    where('stateCode', '==', stateCode)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Case[];
}

export async function getCasesByCountry(countryCode: string): Promise<Case[]> {
  const q = query(
    collection(db, COLLECTION),
    where('countryCode', '==', countryCode)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Case[];
}

export async function addCase(
  data: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCase(
  id: string,
  data: Partial<Omit<Case, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCase(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCaseCountsByCountry(): Promise<Record<string, number>> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const counts: Record<string, number> = {};
  snapshot.docs.forEach((d) => {
    const cc = d.data().countryCode as string;
    if (cc) counts[cc] = (counts[cc] || 0) + 1;
  });
  return counts;
}

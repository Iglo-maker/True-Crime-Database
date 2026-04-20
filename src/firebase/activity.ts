import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface ActivityEntry {
  id: string;
  user: string;
  action: 'add' | 'edit' | 'delete';
  caseTitle: string;
  countryCode: string;
  stateCode: string;
  timestamp: any;
}

export async function logActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    await addDoc(collection(db, 'activity'), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Activity logging is non-critical
  }
}

export async function getRecentActivity(count = 50): Promise<ActivityEntry[]> {
  const q = query(
    collection(db, 'activity'),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ActivityEntry[];
}

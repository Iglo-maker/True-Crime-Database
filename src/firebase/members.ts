import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface MemberDoc {
  name: string;
  active: boolean;
  isAdmin: boolean;
  lastOnline: any;
}

export async function getAllMembers(): Promise<MemberDoc[]> {
  const snapshot = await getDocs(collection(db, 'members'));
  return snapshot.docs.map((d) => ({
    name: d.id,
    ...d.data(),
  })) as MemberDoc[];
}

export async function setMemberActive(name: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, 'members', name), { active });
}

export async function updateLastOnline(name: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'members', name), { lastOnline: serverTimestamp() });
  } catch {
    // Member doc might not exist yet
  }
}

import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// 5 access codes (20 chars, with special characters)
const ACCESS_CODES: Record<string, string> = {
  'aB3$kL9#mP2&xR7!qW5z': 'Nick',
  'dF8@jH4%nT6^yU1*cE3v': 'Salwan',
  'gK2!bN5#pQ8&sV0$wX4m': 'Sulayman',
  'hM7@eR3%tY9^uI1*fJ6z': 'Yu\u015Fa',
  'zZ9$xX8#cC7&vV6!bB5a': 'Admin',
};

export interface Member {
  name: string;
  isAdmin: boolean;
}

/**
 * Validates an access code and returns the member info if valid.
 * Also signs in anonymously to Firebase for Firestore write access,
 * and updates the member's lastOnline timestamp.
 */
export async function loginWithCode(code: string): Promise<Member> {
  const name = ACCESS_CODES[code];
  if (!name) {
    throw new Error('invalid_code');
  }

  // Check if member is active in Firestore
  try {
    // Sign in anonymously for Firestore access
    await signInAnonymously(auth);

    const memberRef = doc(db, 'members', name);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      const data = memberSnap.data();
      if (data.active === false) {
        throw new Error('account_disabled');
      }
      // Update lastOnline
      await updateDoc(memberRef, { lastOnline: serverTimestamp() });
    }
    // If member doc doesn't exist yet (first login before seed), allow login
  } catch (err: any) {
    if (err.message === 'invalid_code' || err.message === 'account_disabled') {
      throw err;
    }
    // Firestore might not be configured yet - allow login anyway
    try {
      await signInAnonymously(auth);
    } catch {
      // Firebase not configured - still allow code-based login
    }
  }

  return {
    name,
    isAdmin: name === 'Admin',
  };
}

export async function logout() {
  localStorage.removeItem('tcg_member');
  try {
    await auth.signOut();
  } catch {
    // ignore
  }
}

export function getSavedMember(): Member | null {
  const saved = localStorage.getItem('tcg_member');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function saveMember(member: Member) {
  localStorage.setItem('tcg_member', JSON.stringify(member));
}

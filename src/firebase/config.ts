import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCw74CMH8mbcETbLU63xtkjQvwUisLsdBo',
  authDomain: 'true-crime-d75c1.firebaseapp.com',
  projectId: 'true-crime-d75c1',
  storageBucket: 'true-crime-d75c1.firebasestorage.app',
  messagingSenderId: '910168837368',
  appId: '1:910168837368:web:8eeefcdfb51b6378cf3f0d',
  measurementId: 'G-98JD3RZNF7',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

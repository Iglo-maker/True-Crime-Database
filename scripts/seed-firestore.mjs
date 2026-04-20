/**
 * Seed script: uploads cases and members to Firestore.
 *
 * Usage:
 *   1. Set your Firebase config in FIREBASE_CONFIG env var or edit below
 *   2. Run: node scripts/seed-firestore.mjs
 *
 * This script:
 *   - Reads all seed-cases-part*.json files
 *   - Uploads each case to Firestore 'cases' collection
 *   - Creates the 5 member documents in 'members' collection
 */

import { readFileSync, readdirSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ── Firebase Config ──────────────────────────────────────────────
// Replace with your actual Firebase config or set FIREBASE_CONFIG env var
const configStr = process.env.FIREBASE_CONFIG;
let firebaseConfig;

if (configStr) {
  firebaseConfig = JSON.parse(configStr);
} else {
  firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  };
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Members ──────────────────────────────────────────────────────
const MEMBERS = [
  { name: 'Nick', active: true, isAdmin: false },
  { name: 'Salwan', active: true, isAdmin: false },
  { name: 'Sulayman', active: true, isAdmin: false },
  { name: 'Yu\u015Fa', active: true, isAdmin: false },
  { name: 'Admin', active: true, isAdmin: true },
];

async function seedMembers() {
  console.log('\n📋 Seeding members...');
  for (const member of MEMBERS) {
    await setDoc(doc(db, 'members', member.name), {
      ...member,
      lastOnline: serverTimestamp(),
    });
    console.log(`  ✓ ${member.name}`);
  }
  console.log(`  Done: ${MEMBERS.length} members`);
}

// ── Cases ────────────────────────────────────────────────────────
async function seedCases() {
  console.log('\n📂 Loading case files...');
  const files = readdirSync('scripts')
    .filter((f) => f.startsWith('seed-cases-part') && f.endsWith('.json'))
    .sort();

  let allCases = [];
  for (const file of files) {
    const data = JSON.parse(readFileSync(`scripts/${file}`, 'utf8'));
    console.log(`  Loaded ${file}: ${data.length} cases`);
    allCases = allCases.concat(data);
  }

  console.log(`\n📤 Uploading ${allCases.length} cases to Firestore...`);
  let count = 0;
  const batchSize = 10;

  for (let i = 0; i < allCases.length; i += batchSize) {
    const batch = allCases.slice(i, i + batchSize);
    await Promise.all(
      batch.map((c) =>
        addDoc(collection(db, 'cases'), {
          ...c,
          createdBy: 'Admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      )
    );
    count += batch.length;
    process.stdout.write(`\r  Progress: ${count}/${allCases.length}`);
  }

  console.log(`\n  Done: ${count} cases uploaded`);
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🌍 True Crime Globe - Firestore Seed');
  console.log('=====================================');

  await seedMembers();
  await seedCases();

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

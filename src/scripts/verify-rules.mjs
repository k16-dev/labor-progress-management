import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from 'firebase/firestore';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertEnv() {
  const missing = Object.entries(cfg).filter(([, v]) => !v);
  if (missing.length) {
    throw new Error(`Missing Firebase env: ${missing.map(([k]) => k).join(', ')}`);
  }
}

async function main() {
  assertEnv();
  const app = initializeApp(cfg);
  const db = getFirestore(app);

  const results = [];

  // 1) Read checks (should pass)
  try {
    const orgSnap = await getDocs(collection(db, 'organizations'));
    results.push({ step: 'read.organizations', ok: true, count: orgSnap.size });
  } catch (e) {
    results.push({ step: 'read.organizations', ok: false, error: e?.message });
  }

  try {
    const taskSnap = await getDocs(collection(db, 'tasks'));
    results.push({ step: 'read.tasks', ok: true, count: taskSnap.size });
  } catch (e) {
    results.push({ step: 'read.tasks', ok: false, error: e?.message });
  }

  // 2) Deny checks (should fail with permission-denied)
  try {
    await addDoc(collection(db, 'tasks'), {
      title: '[TEST] should be denied',
      kind: 'common',
      category: 'block',
      createdByOrgId: 'org_000',
      active: true,
      displayOrder: 9999,
      createdAt: '2099-01-01',
      updatedAt: '2099-01-01',
    });
    results.push({ step: 'deny.create.tasks', ok: false, error: 'unexpected success' });
  } catch (e) {
    results.push({ step: 'deny.create.tasks', ok: true, code: e?.code || 'unknown', message: e?.message });
  }

  // 3) Deny create progress for local task with mismatched org (if local task exists)
  try {
    const taskSnap = await getDocs(collection(db, 'tasks'));
    const orgSnap = await getDocs(collection(db, 'organizations'));
    const localTask = taskSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .find(t => t.kind === 'local');
    const someOrg = orgSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .find(o => o.id !== (localTask?.createdByOrgId || '')); // other org

    if (localTask && someOrg) {
      try {
        await addDoc(collection(db, 'progress'), {
          taskId: localTask.id,
          orgId: someOrg.id,
          status: '進行中',
          memo: '[TEST] deny mismatched org',
          memoHistory: [],
          updatedAt: new Date().toISOString().slice(0, 10),
        });
        results.push({ step: 'deny.create.progress.local.mismatch', ok: false, error: 'unexpected success' });
      } catch (e) {
        results.push({ step: 'deny.create.progress.local.mismatch', ok: true, code: e?.code || 'unknown', message: e?.message });
      }
    } else {
      results.push({ step: 'deny.create.progress.local.mismatch', ok: true, skipped: true, reason: 'no local task or org found' });
    }
  } catch (e) {
    results.push({ step: 'deny.create.progress.local.mismatch', ok: false, error: e?.message });
  }

  // Output
  console.log(JSON.stringify({ results }, null, 2));
}

main().catch(err => {
  console.error('verify failed', err);
  process.exit(1);
});

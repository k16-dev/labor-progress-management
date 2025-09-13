import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteField,
  doc,
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

  // pick a common task
  const tasksSnap = await getDocs(collection(db, 'tasks'));
  const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const task = tasks.find(t => t.kind === 'common' && t.active);
  if (!task) throw new Error('No common task found.');

  // pick an org (non-central)
  const orgsSnap = await getDocs(collection(db, 'organizations'));
  const orgs = orgsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const org = orgs.find(o => o.id !== 'org_000');
  if (!org) throw new Error('No non-central organization found.');

  const today = new Date().toISOString().slice(0, 10);
  const memo = '[TEST] verification write';

  // check existing progress
  const progressQuery = query(
    collection(db, 'progress'),
    where('taskId', '==', task.id),
    where('orgId', '==', org.id)
  );
  const progSnap = await getDocs(progressQuery);

  if (progSnap.empty) {
    const newData = {
      taskId: task.id,
      orgId: org.id,
      status: '進行中',
      memo,
      memoHistory: [{ memo, orgId: org.id, timestamp: new Date().toISOString() }],
      updatedAt: today,
    };
    const ref = await addDoc(collection(db, 'progress'), newData);
    console.log(JSON.stringify({ ok: true, action: 'create', id: ref.id, taskId: task.id, orgId: org.id }, null, 2));
  } else {
    const d = progSnap.docs[0];
    await updateDoc(doc(db, 'progress', d.id), {
      status: '進行中',
      memo,
      memoHistory: [...(d.data().memoHistory || []), { memo, orgId: org.id, timestamp: new Date().toISOString() }],
      completedAt: deleteField(),
      updatedAt: today,
    });
    console.log(JSON.stringify({ ok: true, action: 'update', id: d.id, taskId: task.id, orgId: org.id }, null, 2));
  }
}

main().catch(err => {
  console.error('write-test-progress failed:', err?.message || err);
  process.exit(1);
});


import * as admin from 'firebase-admin';
import { organizationsData } from './seed-organizations';
import { Task, TaskCategory, TaskKind } from '@/types';

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function seedOrganizations() {
  console.log('Seeding organizations...');
  const batch = db.batch();
  
  organizationsData.forEach((org, index) => {
    const ref = db.collection('organizations').doc(`org_${index.toString().padStart(3, '0')}`);
    batch.set(ref, org);
  });
  
  await batch.commit();
  console.log(`✓ ${organizationsData.length} organizations seeded`);
}

async function seedTasks() {
  console.log('Seeding tasks...');
  const now = new Date().toISOString().slice(0, 10);
  
  const tasks: Omit<Task, 'id'>[] = [
    {
      title: '全ブロック共通タスク',
      category: 'block' as TaskCategory,
      kind: 'common' as TaskKind,
      createdByOrgId: 'org_000', // 中央
      active: true,
      memo: 'すべてのブロックで実施する共通タスクです',
      createdAt: now,
      updatedAt: now
    },
    {
      title: '全支部共通タスク',
      category: 'branch' as TaskCategory,
      kind: 'common' as TaskKind,
      createdByOrgId: 'org_000', // 中央
      active: true,
      memo: 'すべての支部で実施する共通タスクです',
      createdAt: now,
      updatedAt: now
    },
    {
      title: '全分会共通タスク',
      category: 'sub' as TaskCategory,
      kind: 'common' as TaskKind,
      createdByOrgId: 'org_000', // 中央
      active: true,
      memo: 'すべての分会で実施する共通タスクです',
      createdAt: now,
      updatedAt: now
    },
    {
      title: '幕張支部ローカルタスク',
      category: 'branch' as TaskCategory,
      kind: 'local' as TaskKind,
      createdByOrgId: 'org_062', // 幕張支部
      active: true,
      memo: '幕張支部独自のタスクです',
      createdAt: now,
      updatedAt: now
    },
    {
      title: '北海道分会ローカルタスク',
      category: 'sub' as TaskCategory,
      kind: 'local' as TaskKind,
      createdByOrgId: 'org_010', // 北海道分会
      active: true,
      memo: '北海道分会独自のタスクです',
      createdAt: now,
      updatedAt: now
    }
  ];
  
  const batch = db.batch();
  
  tasks.forEach((task, index) => {
    const ref = db.collection('tasks').doc(`task_${index.toString().padStart(3, '0')}`);
    batch.set(ref, task);
  });
  
  await batch.commit();
  console.log(`✓ ${tasks.length} tasks seeded`);
}

async function main() {
  try {
    console.log('Starting database seeding...');
    await seedOrganizations();
    await seedTasks();
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
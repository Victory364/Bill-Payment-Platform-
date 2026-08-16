import { initDb } from './db.js';

async function test() {
  console.log('Testing database initialization...');
  const success = await initDb();
  console.log('Initialization result:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
}

test();

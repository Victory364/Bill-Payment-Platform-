import { PrismaClient } from '@prisma/client';

let prisma;
try {
  prisma = new PrismaClient();
} catch (err) {
  console.error('\n❌ ============================================================');
  console.error('Prisma Client has not been generated yet!');
  console.error('To fix this, open your terminal in the "server" directory and run:');
  console.error('\n    npx prisma generate\n');
  console.error('Then restart with: npm run dev');
  console.error('============================================================\n');
  process.exit(1);
}

export default prisma;

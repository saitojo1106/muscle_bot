import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// 複数の場所で環境変数を読み込み
config({
  path: '.env.local',
});

config({
  path: '.env',
});

const runMigrate = async () => {
  // 環境変数の存在確認
  console.log('Environment check:');
  console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
  console.log('POSTGRES_URL length:', process.env.POSTGRES_URL?.length || 0);

  if (!process.env.POSTGRES_URL) {
    console.error(
      'Available environment variables:',
      Object.keys(process.env).filter((key) => key.includes('POSTGRES')),
    );
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});

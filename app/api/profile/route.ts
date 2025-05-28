import { auth } from '@/app/(auth)/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// データベース接続を直接作成
const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error('POSTGRES_URL environment variable is not set');
}
const client = postgres(postgresUrl);
const db = drizzle(client);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    return NextResponse.json(profile || null);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profileData = await request.json();

    // JSON配列をstringに変換
    const insertData = {
      ...profileData,
      userId: session.user.id,
      goals: profileData.goals ? JSON.stringify(profileData.goals) : null,
      currentHabits: profileData.currentHabits
        ? JSON.stringify(profileData.currentHabits)
        : null,
    };

    await db.insert(userProfiles).values(insertData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 },
    );
  }
}

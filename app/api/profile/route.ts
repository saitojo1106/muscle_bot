import { auth } from '@/app/(auth)/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateUUID } from '@/lib/utils';

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

    // 既存のプロフィールがある場合は更新、ない場合は作成
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      // 更新の場合は既存のIDを保持し、createdAtは変更しない
      await db
        .update(userProfiles)
        .set({
          gender: profileData.gender,
          occupation: profileData.occupation,
          age: profileData.age,
          height: profileData.height,
          weight: profileData.weight,
          fitnessLevel: profileData.fitnessLevel,
          goals: profileData.goals ? JSON.stringify(profileData.goals) : null,
          trainingFrequency: profileData.trainingFrequency,
          preferredTrainingTime: profileData.preferredTrainingTime,
          dietaryRestrictions: profileData.dietaryRestrictions,
          dailyCalories: profileData.dailyCalories,
          proteinGoal: profileData.proteinGoal,
          currentHabits: profileData.currentHabits
            ? JSON.stringify(profileData.currentHabits)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, session.user.id));
    } else {
      // 新規作成の場合のみ新しいIDを生成
      const insertData = {
        id: generateUUID(),
        userId: session.user.id,
        gender: profileData.gender,
        occupation: profileData.occupation,
        age: profileData.age,
        height: profileData.height,
        weight: profileData.weight,
        fitnessLevel: profileData.fitnessLevel,
        goals: profileData.goals ? JSON.stringify(profileData.goals) : null,
        trainingFrequency: profileData.trainingFrequency,
        preferredTrainingTime: profileData.preferredTrainingTime,
        dietaryRestrictions: profileData.dietaryRestrictions,
        dailyCalories: profileData.dailyCalories,
        proteinGoal: profileData.proteinGoal,
        currentHabits: profileData.currentHabits
          ? JSON.stringify(profileData.currentHabits)
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(userProfiles).values(insertData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 },
    );
  }
}

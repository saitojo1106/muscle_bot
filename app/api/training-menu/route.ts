import { auth } from '@/app/(auth)/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  trainingPlans,
  trainingDays,
  trainingExercises,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateUUID } from '@/lib/utils';

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
    // ユーザーのアクティブなトレーニングプランを取得
    const [activePlan] = await db
      .select()
      .from(trainingPlans)
      .where(
        and(
          eq(trainingPlans.userId, session.user.id),
          eq(trainingPlans.isActive, true),
        ),
      )
      .limit(1);

    if (!activePlan) {
      return NextResponse.json({ trainingDays: [] });
    }

    // トレーニング日を取得
    const days = await db
      .select()
      .from(trainingDays)
      .where(eq(trainingDays.planId, activePlan.id))
      .orderBy(trainingDays.dayNumber);

    // 各日のエクササイズを取得
    const trainingDaysWithExercises = await Promise.all(
      days.map(async (day) => {
        const exercises = await db
          .select()
          .from(trainingExercises)
          .where(eq(trainingExercises.dayId, day.id))
          .orderBy(trainingExercises.order);

        return {
          id: day.id,
          dayNumber: day.dayNumber,
          name: day.name,
          isRestDay: day.isRestDay,
          exercises: exercises.map((ex) => ({
            id: ex.id,
            exerciseName: ex.exerciseName,
            targetMuscle: ex.targetMuscle,
            weight: ex.weight,
            sets: ex.sets,
            reps: ex.reps,
            purpose: ex.purpose,
            order: ex.order,
          })),
        };
      }),
    );

    return NextResponse.json({ trainingDays: trainingDaysWithExercises });
  } catch (error) {
    console.error('Failed to get training menu:', error);
    return NextResponse.json({ trainingDays: [] });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trainingDays: requestTrainingDays } = await request.json();

    if (!requestTrainingDays || !Array.isArray(requestTrainingDays)) {
      return NextResponse.json(
        { error: 'Invalid training days data' },
        { status: 400 },
      );
    }

    // トランザクション的な処理：既存のプランを無効化してから新しいプランを作成
    await db
      .update(trainingPlans)
      .set({ isActive: false })
      .where(eq(trainingPlans.userId, session.user.id));

    // 新しいプランを作成
    const planId = generateUUID();
    await db.insert(trainingPlans).values({
      id: planId,
      userId: session.user.id,
      name: 'メインプログラム',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // トレーニング日とエクササイズを保存
    for (const day of requestTrainingDays) {
      const dayId = generateUUID();

      // トレーニング日を保存
      await db.insert(trainingDays).values({
        id: dayId,
        planId: planId,
        dayNumber: day.dayNumber || 1,
        name: day.name || '',
        isRestDay: day.isRestDay || false,
        createdAt: new Date(),
      });

      // エクササイズを保存（オフ日でない場合）
      if (
        !day.isRestDay &&
        day.exercises &&
        Array.isArray(day.exercises) &&
        day.exercises.length > 0
      ) {
        const exerciseValues = day.exercises.map(
          (exercise: any, index: number) => ({
            id: generateUUID(),
            dayId: dayId,
            exerciseName: exercise.exerciseName || '',
            targetMuscle: exercise.targetMuscle || '',
            weight: exercise.weight || null,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            purpose: exercise.purpose || '',
            order: exercise.order !== undefined ? exercise.order : index,
            createdAt: new Date(),
          }),
        );

        await db.insert(trainingExercises).values(exerciseValues);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save training menu:', error);
    return NextResponse.json(
      { error: 'Failed to save training menu' },
      { status: 500 },
    );
  }
}

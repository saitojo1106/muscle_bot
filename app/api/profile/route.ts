import { auth } from '@/app/(auth)/auth';
import { saveUserProfile, getUserProfile } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(session.user.id);
    return NextResponse.json(profile);
  } catch (error) {
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
    await saveUserProfile({
      ...profileData,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 },
    );
  }
}

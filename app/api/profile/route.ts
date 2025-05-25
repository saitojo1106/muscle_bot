import { auth } from '@/app/(auth)/auth';
import { getUserProfile, saveUserProfile } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.type === 'guest') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const profile = await getUserProfile(session.user.id);
    return NextResponse.json(profile);
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === 'guest') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const profileData = await request.json();
    const profile = await saveUserProfile({
      ...profileData,
      userId: session.user.id,
    });

    return NextResponse.json(profile);
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

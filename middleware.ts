import { auth } from '@/app/(auth)/auth';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // 認証不要のパス
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/progress') || // プログレス追跡を追加
    pathname.startsWith('/chat') // チャットページを追加
  ) {
    return NextResponse.next();
  }

  // 認証済みユーザーがログイン/登録ページにアクセスした場合
  if (session?.user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 未認証ユーザーがトップページにアクセスした場合は自動ゲスト認証
  if (!session?.user && pathname === '/') {
    return NextResponse.redirect(new URL('/api/auth/guest', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

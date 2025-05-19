import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // ログインしていない場合にアクセス制限されるページのリスト
  if (!session?.user && pathname !== '/login' && pathname !== '/register' && !pathname.startsWith('/api/auth')) {
    // /loginにリダイレクトするのではなく、ゲスト認証を試みる
    return NextResponse.redirect(new URL('/api/auth/guest', request.url));
  }

  // ログイン済みユーザーがログインページやサインアップページにアクセスしようとした場合
  if (session?.user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

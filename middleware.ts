import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // すべてのリクエストを許可する
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

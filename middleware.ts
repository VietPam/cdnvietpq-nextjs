// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu cố vào /media mà chưa có token -> Đá sang /login ngay lập tức
  if (pathname.startsWith('/media') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Nếu đã có token mà cố vào /login -> Đá về trang chủ
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Chỉ chạy middleware cho các đường dẫn này
export const config = {
  matcher: ['/media/:path*', '/login'],
};
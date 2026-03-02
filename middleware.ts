import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hàm hỗ trợ kiểm tra JWT Token hợp lệ và còn hạn
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // Không đúng chuẩn JWT
    
    // Decode base64url payload (Edge Runtime hỗ trợ atob)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Kiểm tra hạn sử dụng (exp) tính bằng giây
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    }
    
    return true; // Nếu token không có trường exp, tạm coi là hợp lệ
  } catch (error) {
    return false; // Lỗi khi giải mã -> token giả mạo hoặc sai định dạng
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const hasValidToken = isTokenValid(token);

  // 1. Nếu cố vào /media mà token không có hoặc đã HẾT HẠN/GIẢ MẠO -> Đá sang /login
  if (pathname.startsWith('/media') && !hasValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Chủ động xóa cookie token rác/hết hạn để dọn dẹp trình duyệt
    if (token) {
      response.cookies.delete('auth_token');
    }
    return response;
  }

  // 2. Nếu đã có token HỢP LỆ mà cố vào /login -> Đá về trang chủ
  if (pathname === '/login' && hasValidToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Chỉ chạy middleware cho các đường dẫn này (Trang chủ '/' không bị ảnh hưởng)
export const config = {
  matcher: ['/media/:path*', '/login'],
};
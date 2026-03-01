// lib/auth.ts
import Cookies from 'js-cookie';

export const auth = {
  setToken: (token: string) => {
    // Lưu vào cookie, tồn tại trong 7 ngày, path '/' để toàn bộ app đều thấy
    Cookies.set('auth_token', token, { expires: 7, path: '/' });
  },
  
  getToken: () => {
    return Cookies.get('auth_token');
  },

  // 👉 Lấy thông tin User từ phần Payload của JWT
  getUser: () => {
    const token = Cookies.get('auth_token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  },

  logout: () => {
    Cookies.remove('auth_token', { path: '/' });
    window.location.href = '/login';
  },

  isLoggedIn: () => {
    return !!Cookies.get('auth_token');
  }
};
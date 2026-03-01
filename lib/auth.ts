// src/lib/auth.ts
import Cookies from 'js-cookie';

export const auth = {
  setToken: (token: string) => {
    // Lưu vào cookie, tồn tại trong 7 ngày
    Cookies.set('auth_token', token, { expires: 7, path: '/' });
  },
  getToken: () => {
    return Cookies.get('auth_token');
  },
  logout: () => {
    Cookies.remove('auth_token', { path: '/' });
    window.location.href = '/login';
  },
  isLoggedIn: () => {
    return !!Cookies.get('auth_token');
  }
};
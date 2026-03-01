// src/lib/auth.ts
export const auth = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cdn_token", token);
    }
  },
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cdn_token");
    }
    return null;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cdn_token");
      window.location.href = "/login";
    }
  },
  isLoggedIn: () => {
    return !!auth.getToken();
  }
};
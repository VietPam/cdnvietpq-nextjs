// src/lib/api.ts
import { auth } from "./auth"; // Import helper quản lý token

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    // Giữ lại API_KEY nếu Backend vẫn yêu cầu song song
    "x-api-key": API_KEY,
    ...(options?.headers as Record<string, string>),
  };

  // 👉 THÊM VÀO ĐÂY: Tự động lấy JWT từ localStorage
  const token = auth.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  // Xử lý khi Token hết hạn hoặc không hợp lệ
  if (res.status === 401) {
    console.warn("Phiên đăng nhập hết hạn, đang đăng xuất...");
    auth.logout(); 
    throw new Error("Unauthorized: Phiên đăng nhập hết hạn");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "API request failed");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: any) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
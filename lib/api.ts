const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "x-api-key": API_KEY,
    ...(options?.headers as Record<string, string>),
  };

  // Nếu không phải FormData thì mới set Content-Type là JSON
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text() || "API request failed");
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: any) => request<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
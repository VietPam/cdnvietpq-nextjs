import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;
const API_KEY = process.env.API_KEY!;

async function forward(
  req: NextRequest,
  method: string,
  path: string[]
) {
  const search = req.nextUrl.search || "";
  const url = `${BACKEND_URL}/${path.join("/")}${search}`;

  console.log("==== PROXY DEBUG ====");
  console.log("METHOD:", method);
  console.log("URL:", url);
  console.log("API_KEY:", API_KEY);

  const headers: Record<string, string> = {};

  // CHỈ gửi API KEY khi cần
  if (method === "POST" || method === "DELETE") {
    headers["x-api-key"] = API_KEY;
  }

  let body: any = undefined;

  if (method === "POST") {
    body = await req.formData();
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  console.log("STATUS:", res.status);

  const text = await res.text();
  console.log("RESPONSE:", text);

  return new Response(text, {
    status: res.status,
  });
}

export async function GET(req: NextRequest, context: any) {
  const { path } = await context.params;
  return forward(req, "GET", path);
}

export async function POST(req: NextRequest, context: any) {
  const { path } = await context.params;
  return forward(req, "POST", path);
}

export async function DELETE(req: NextRequest, context: any) {
  const { path } = await context.params;
  return forward(req, "DELETE", path);
}
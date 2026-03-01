import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;
const API_KEY = process.env.API_KEY!;

async function forward(
  req: NextRequest,
  method: string,
  path: string[]
) {
  const url = `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`;

  const headers: any = {
    "x-api-key": API_KEY,
  };

  let body: any = undefined;

  if (method === "POST") {
    body = await req.formData();
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return Response.json(await res.json(), { status: res.status });
  }

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: res.headers,
  });
}

export async function GET(
  req: NextRequest,
  { params }: any
) {
  return forward(req, "GET", params.path);
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  return forward(req, "POST", params.path);
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  return forward(req, "DELETE", params.path);
}
import { NextResponse } from "next/server";

function getOrigin(request: Request): string {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;

  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".localhost");

  // Local dev must stay http://localhost:PORT — never https://localhost
  if (isLocal) {
    return `http://${host}`;
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(":", "") ||
    "https";

  return `${proto}://${host}`;
}

export function GET(request: Request) {
  const origin = getOrigin(request);
  const home = new URL("/home", origin);
  const response = NextResponse.redirect(home, 303);

  response.cookies.set("cf_verified", "1", {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    secure: home.protocol === "https:",
  });

  return response;
}
